# analyzer/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Dataset, AnalysisReport


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class DatasetSerializer(serializers.ModelSerializer):
    """Serializer for Dataset model"""
    user = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Dataset
        fields = [
            'id', 'user', 'filename', 'file', 'file_url', 'uploaded_at',
            'total_records', 'summary_stats', 'equipment_types',
            'file_size', 'columns'
        ]
        read_only_fields = [
            'uploaded_at', 'total_records', 'summary_stats',
            'equipment_types', 'file_size', 'columns'
        ]
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DatasetUploadSerializer(serializers.Serializer):
    """Serializer for CSV file upload"""
    file = serializers.FileField()
    
    def validate_file(self, value):
        """Validate that the uploaded file is a CSV"""
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("Only CSV files are allowed.")
        
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB.")
        
        return value


class AnalysisReportSerializer(serializers.ModelSerializer):
    """Serializer for Analysis Report model"""
    dataset = DatasetSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    report_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AnalysisReport
        fields = [
            'id', 'dataset', 'user', 'report_file', 'report_url',
            'generated_at', 'report_type'
        ]
        read_only_fields = ['generated_at']
    
    def get_report_url(self, obj):
        request = self.context.get('request')
        if obj.report_file and hasattr(obj.report_file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.report_file.url)
            return obj.report_file.url
        return None


class DataSummarySerializer(serializers.Serializer):
    """Serializer for data summary response"""
    total_records = serializers.IntegerField()
    columns = serializers.ListField(child=serializers.CharField())
    summary_stats = serializers.DictField()
    equipment_types = serializers.DictField()
    dataset_id = serializers.IntegerField()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user