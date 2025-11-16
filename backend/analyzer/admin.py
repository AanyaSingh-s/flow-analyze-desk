# analyzer/admin.py
from django.contrib import admin
from .models import Dataset, AnalysisReport


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ['filename', 'user', 'total_records', 'uploaded_at']
    list_filter = ['uploaded_at', 'user']
    search_fields = ['filename', 'user__username']
    readonly_fields = ['uploaded_at', 'total_records', 'summary_stats', 'equipment_types', 'file_size', 'columns']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'filename', 'file', 'uploaded_at')
        }),
        ('Statistics', {
            'fields': ('total_records', 'file_size', 'columns', 'summary_stats', 'equipment_types')
        }),
    )


@admin.register(AnalysisReport)
class AnalysisReportAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'user', 'report_type', 'generated_at']
    list_filter = ['generated_at', 'report_type', 'user']
    search_fields = ['dataset__filename', 'user__username']
    readonly_fields = ['generated_at']
