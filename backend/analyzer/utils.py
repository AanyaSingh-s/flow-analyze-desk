# analyzer/utils.py
import pandas as pd
import numpy as np
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import os
from django.conf import settings


def analyze_csv_data(df):
    """
    Analyze CSV data and return summary statistics
    
    Args:
        df: pandas DataFrame
    
    Returns:
        dict: Analysis results with summary stats and equipment types
    """
    analysis = {}
    
    # Basic info
    analysis['total_records'] = len(df)
    analysis['columns'] = df.columns.tolist()
    
    # Summary statistics for numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    summary_stats = {}
    
    for col in numeric_cols:
        summary_stats[col] = {
            'mean': float(df[col].mean()),
            'median': float(df[col].median()),
            'std': float(df[col].std()),
            'min': float(df[col].min()),
            'max': float(df[col].max()),
            'count': int(df[col].count())
        }
    
    analysis['summary_stats'] = summary_stats
    
    # Equipment type distribution (if 'Type' column exists)
    equipment_types = {}
    if 'Type' in df.columns:
        type_counts = df['Type'].value_counts().to_dict()
        equipment_types = {str(k): int(v) for k, v in type_counts.items()}
    
    analysis['equipment_types'] = equipment_types
    
    return analysis


def generate_pdf_report(dataset, df, user):
    """
    Generate PDF report for a dataset
    
    Args:
        dataset: Dataset model instance
        df: pandas DataFrame with data
        user: User model instance
    
    Returns:
        str: Path to generated PDF file
    """
    # Create reports directory if it doesn't exist
    reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"report_{dataset.id}_{timestamp}.pdf"
    filepath = os.path.join(reports_dir, filename)
    
    # Create PDF
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    title = Paragraph("Chemical Equipment Data Analysis Report", title_style)
    story.append(title)
    story.append(Spacer(1, 0.3*inch))
    
    # Report Information
    info_data = [
        ['Report Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ['Dataset:', dataset.filename],
        ['Uploaded By:', user.username],
        ['Total Records:', str(dataset.total_records)],
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Summary Statistics
    story.append(Paragraph("Summary Statistics", heading_style))
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if numeric_cols:
        stats_data = [['Metric'] + numeric_cols]
        
        for stat in ['Mean', 'Median', 'Std Dev', 'Min', 'Max']:
            row = [stat]
            for col in numeric_cols:
                if stat == 'Mean':
                    val = df[col].mean()
                elif stat == 'Median':
                    val = df[col].median()
                elif stat == 'Std Dev':
                    val = df[col].std()
                elif stat == 'Min':
                    val = df[col].min()
                else:  # Max
                    val = df[col].max()
                row.append(f"{val:.2f}")
            stats_data.append(row)
        
        stats_table = Table(stats_data, colWidths=[1.5*inch] + [1.2*inch]*len(numeric_cols))
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        story.append(stats_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Equipment Type Distribution
    if 'Type' in df.columns:
        story.append(Paragraph("Equipment Type Distribution", heading_style))
        
        type_counts = df['Type'].value_counts()
        type_data = [['Equipment Type', 'Count', 'Percentage']]
        
        total = len(df)
        for equip_type, count in type_counts.items():
            percentage = (count / total) * 100
            type_data.append([str(equip_type), str(count), f"{percentage:.1f}%"])
        
        type_table = Table(type_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        type_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        story.append(type_table)
        story.append(Spacer(1, 0.3*inch))
    
    # Data Preview (first 10 rows)
    story.append(PageBreak())
    story.append(Paragraph("Data Preview (First 10 Records)", heading_style))
    
    preview_df = df.head(10)
    preview_data = [preview_df.columns.tolist()] + preview_df.values.tolist()
    
    # Convert all values to strings and limit width
    preview_data = [[str(val)[:20] for val in row] for row in preview_data]
    
    col_width = 6.5*inch / len(df.columns)
    preview_table = Table(preview_data, colWidths=[col_width]*len(df.columns))
    preview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    story.append(preview_table)
    
    # Build PDF
    doc.build(story)
    
    return filepath


def cleanup_old_datasets(user, max_count=5):
    """
    Keep only the latest max_count datasets for a user
    
    Args:
        user: User model instance
        max_count: Maximum number of datasets to keep
    """
    from .models import Dataset
    
    datasets = Dataset.objects.filter(user=user).order_by('-uploaded_at')
    
    if datasets.count() > max_count:
        # Get datasets to delete
        to_delete = datasets[max_count:]
        
        # Delete files and database records
        for dataset in to_delete:
            if dataset.file:
                try:
                    if os.path.exists(dataset.file.path):
                        os.remove(dataset.file.path)
                except Exception:
                    pass
            dataset.delete()