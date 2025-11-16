# analyzer/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models import Count
import pandas as pd
import io
import os

from .models import Dataset, AnalysisReport
from .serializers import (
    DatasetSerializer, DatasetUploadSerializer, AnalysisReportSerializer,
    DataSummarySerializer, UserRegistrationSerializer, UserSerializer
)
from .utils import analyze_csv_data, generate_pdf_report, cleanup_old_datasets


class DatasetViewSet(viewsets.ModelViewSet):
    """ViewSet for Dataset CRUD operations"""
    serializer_class = DatasetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return datasets for the current user only"""
        return Dataset.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'], serializer_class=DatasetUploadSerializer)
    def upload(self, request):
        """Upload and analyze a CSV file"""
        serializer = DatasetUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = serializer.validated_data['file']
        
        try:
            # Read and analyze CSV
            df = pd.read_csv(file)
            analysis_result = analyze_csv_data(df)
            
            # Create dataset instance
            dataset = Dataset.objects.create(
                user=request.user,
                filename=file.name,
                file=file,
                total_records=analysis_result['total_records'],
                summary_stats=analysis_result['summary_stats'],
                equipment_types=analysis_result['equipment_types'],
                file_size=file.size,
                columns=analysis_result['columns']
            )
            
            # Cleanup old datasets (keep only last 5)
            cleanup_old_datasets(request.user, max_count=settings.MAX_DATASET_HISTORY)
            
            return Response({
                'message': 'File uploaded and analyzed successfully',
                'dataset': DatasetSerializer(dataset, context={'request': request}).data,
                'summary': analysis_result
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'error': f'Error processing CSV file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get detailed summary of a specific dataset"""
        dataset = self.get_object()
        
        try:
            # Re-read CSV for fresh data
            df = pd.read_csv(dataset.file.path)
            analysis_result = analyze_csv_data(df)
            
            return Response(analysis_result, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': f'Error reading dataset: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """Get raw data from the dataset with pagination"""
        dataset = self.get_object()
        
        try:
            df = pd.read_csv(dataset.file.path)
            
            # Get pagination parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 100))
            
            # Calculate pagination
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            
            # Get paginated data
            paginated_df = df.iloc[start_idx:end_idx]
            
            return Response({
                'total_records': len(df),
                'page': page,
                'page_size': page_size,
                'total_pages': (len(df) + page_size - 1) // page_size,
                'columns': df.columns.tolist(),
                'data': paginated_df.to_dict('records')
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': f'Error reading dataset: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get upload history for the current user"""
        datasets = self.get_queryset()[:settings.MAX_DATASET_HISTORY]
        serializer = self.get_serializer(datasets, many=True)
        
        return Response({
            'count': datasets.count(),
            'max_history': settings.MAX_DATASET_HISTORY,
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def generate_report(self, request, pk=None):
        """Generate PDF report for a dataset"""
        dataset = self.get_object()
        
        try:
            # Read CSV data
            df = pd.read_csv(dataset.file.path)
            
            # Generate PDF report
            report_path = generate_pdf_report(dataset, df, request.user)
            
            # Create AnalysisReport instance
            with open(report_path, 'rb') as f:
                report = AnalysisReport.objects.create(
                    dataset=dataset,
                    user=request.user,
                    report_file=f,
                    report_type='summary'
                )
            
            # Clean up temporary file
            if os.path.exists(report_path):
                os.remove(report_path)
            
            return Response({
                'message': 'Report generated successfully',
                'report': AnalysisReportSerializer(report, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'error': f'Error generating report: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class AnalysisReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing analysis reports"""
    serializer_class = AnalysisReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return reports for the current user only"""
        return AnalysisReport.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user and return token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Please provide both username and password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'token': token.key
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by deleting token"""
    try:
        request.user.auth_token.delete()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    user = request.user
    datasets_count = Dataset.objects.filter(user=user).count()
    reports_count = AnalysisReport.objects.filter(user=user).count()
    
    return Response({
        'user': UserSerializer(user).data,
        'datasets_count': datasets_count,
        'reports_count': reports_count
    }, status=status.HTTP_200_OK)
