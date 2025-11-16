# analyzer/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class Dataset(models.Model):
    """Store uploaded datasets with metadata and summary statistics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='datasets/')
    uploaded_at = models.DateTimeField(default=timezone.now)
    
    # Summary statistics stored as JSON
    total_records = models.IntegerField(default=0)
    summary_stats = models.JSONField(default=dict, blank=True)
    equipment_types = models.JSONField(default=dict, blank=True)
    
    # Metadata
    file_size = models.IntegerField(default=0)  # in bytes
    columns = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['-uploaded_at']),
            models.Index(fields=['user', '-uploaded_at']),
        ]
    
    def __str__(self):
        return f"{self.filename} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_summary_dict(self):
        """Return a dictionary with complete summary information"""
        return {
            'id': self.id,
            'filename': self.filename,
            'uploaded_at': self.uploaded_at.isoformat(),
            'total_records': self.total_records,
            'file_size': self.file_size,
            'columns': self.columns,
            'summary_stats': self.summary_stats,
            'equipment_types': self.equipment_types,
        }


class AnalysisReport(models.Model):
    """Store generated PDF reports"""
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report_file = models.FileField(upload_to='reports/')
    generated_at = models.DateTimeField(default=timezone.now)
    report_type = models.CharField(max_length=50, default='summary')
    
    class Meta:
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"Report for {self.dataset.filename} - {self.generated_at.strftime('%Y-%m-%d %H:%M')}"
