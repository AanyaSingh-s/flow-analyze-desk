# desktop/gui/charts_widget.py
from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                             QComboBox, QFrame, QSizePolicy)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
import matplotlib
matplotlib.use('Qt5Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import pandas as pd
import numpy as np


class ChartsWidget(QWidget):
    """Widget to display various charts using Matplotlib"""
    
    def __init__(self):
        super().__init__()
        self.current_data = None
        self.setStyleSheet("background: transparent;")
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.setMinimumHeight(500)
        self.init_ui()
    
    def init_ui(self):
        """Initialize UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(12)
        
        # Header frame
        header_frame = QFrame()
        header_frame.setStyleSheet("""
            QFrame {
                background: rgba(30, 41, 59, 0.7);
                border-radius: 8px;
            }
        """)
        header_frame.setFixedHeight(60)
        header_layout = QHBoxLayout(header_frame)
        header_layout.setContentsMargins(16, 10, 16, 10)
        header_layout.setSpacing(12)
        
        # Title
        title = QLabel("📈 Data Visualizations")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title.setFont(title_font)
        title.setStyleSheet("color: white; background: transparent;")
        header_layout.addWidget(title)
        
        header_layout.addStretch()
        
        # Chart type selector
        selector_label = QLabel("Chart Type:")
        selector_label.setStyleSheet("color: #e2e8f0; font-size: 12px; font-weight: 600; background: transparent;")
        header_layout.addWidget(selector_label)
        
        self.chart_type_combo = QComboBox()
        self.chart_type_combo.addItems([
            "Equipment Distribution",
            "Flowrate Analysis",
            "Pressure Analysis",
            "Temperature Analysis",
            "Correlation Heatmap"
        ])
        self.chart_type_combo.setMinimumWidth(180)
        self.chart_type_combo.setStyleSheet("""
            QComboBox {
                background: rgba(30, 41, 59, 0.95);
                border: 1px solid rgba(148, 163, 184, 0.4);
                border-radius: 6px;
                padding: 8px 12px;
                color: white;
                font-size: 12px;
            }
            QComboBox:hover {
                border: 1px solid #3b82f6;
            }
            QComboBox::drop-down {
                border: none;
                padding-right: 8px;
            }
            QComboBox::down-arrow {
                image: none;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 5px solid white;
            }
            QComboBox QAbstractItemView {
                background: rgba(15, 23, 42, 0.98);
                border: 1px solid rgba(148, 163, 184, 0.3);
                border-radius: 6px;
                selection-background-color: rgba(59, 130, 246, 0.4);
                color: white;
                padding: 4px;
            }
        """)
        self.chart_type_combo.currentTextChanged.connect(self.update_chart)
        header_layout.addWidget(self.chart_type_combo)
        
        layout.addWidget(header_frame)
        
        # Chart container
        chart_frame = QFrame()
        chart_frame.setStyleSheet("""
            QFrame {
                background: rgba(30, 41, 59, 0.7);
                border-radius: 8px;
            }
        """)
        chart_frame.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        chart_layout = QVBoxLayout(chart_frame)
        chart_layout.setContentsMargins(8, 8, 8, 8)
        
        # Matplotlib figure - larger size for subplots
        self.figure = Figure(figsize=(12, 8), facecolor='#1e293b', dpi=80)
        self.canvas = FigureCanvas(self.figure)
        self.canvas.setStyleSheet("background: #1e293b;")
        self.canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.canvas.setMinimumHeight(400)
        chart_layout.addWidget(self.canvas)
        
        layout.addWidget(chart_frame, 1)
    
    def update_charts(self, df: pd.DataFrame):
        """Update charts with new data"""
        self.current_data = df
        self.update_chart()
    
    def update_chart(self):
        """Update the displayed chart based on selection"""
        self.figure.clear()
        
        if self.current_data is None or self.current_data.empty:
            ax = self.figure.add_subplot(111)
            ax.set_facecolor('#1e293b')
            ax.text(0.5, 0.5, 'No data available\nUpload a CSV file to see charts', 
                   ha='center', va='center', transform=ax.transAxes,
                   color='#94a3b8', fontsize=14)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)
            self.canvas.draw()
            return
        
        chart_type = self.chart_type_combo.currentText()
        
        try:
            if chart_type == "Equipment Distribution":
                self.plot_equipment_distribution()
            elif chart_type == "Flowrate Analysis":
                self.plot_metric_analysis('Flowrate')
            elif chart_type == "Pressure Analysis":
                self.plot_metric_analysis('Pressure')
            elif chart_type == "Temperature Analysis":
                self.plot_metric_analysis('Temperature')
            elif chart_type == "Correlation Heatmap":
                self.plot_correlation_heatmap()
        except Exception as e:
            print(f"Chart error: {e}")
            self.figure.clear()
            ax = self.figure.add_subplot(111)
            ax.set_facecolor('#1e293b')
            ax.text(0.5, 0.5, f'Error creating chart:\n{str(e)}', 
                   ha='center', va='center', transform=ax.transAxes,
                   color='#ef4444', fontsize=12)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)
        
        self.canvas.draw()
    
    def plot_equipment_distribution(self):
        """Plot equipment type distribution as bar chart"""
        if 'Type' not in self.current_data.columns:
            ax = self.figure.add_subplot(111)
            ax.set_facecolor('#1e293b')
            ax.text(0.5, 0.5, 'No "Type" column found in data', 
                   ha='center', va='center', transform=ax.transAxes,
                   color='#f59e0b', fontsize=14)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)
            return
        
        type_counts = self.current_data['Type'].value_counts()
        
        ax = self.figure.add_subplot(111)
        ax.set_facecolor('#1e293b')
        
        colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
        bar_colors = [colors[i % len(colors)] for i in range(len(type_counts))]
        
        x_pos = range(len(type_counts))
        bars = ax.bar(x_pos, type_counts.values, color=bar_colors, 
                      edgecolor='white', linewidth=1, alpha=0.9)
        
        ax.set_xlabel('Equipment Type', fontsize=11, fontweight='bold', color='#e2e8f0', labelpad=10)
        ax.set_ylabel('Count', fontsize=11, fontweight='bold', color='#e2e8f0', labelpad=10)
        ax.set_title('Equipment Type Distribution', fontsize=13, fontweight='bold', 
                     pad=15, color='white')
        ax.set_xticks(x_pos)
        ax.set_xticklabels(type_counts.index, rotation=30, ha='right', color='#cbd5e1', fontsize=9)
        ax.tick_params(colors='#cbd5e1', labelsize=9)
        ax.grid(axis='y', alpha=0.2, color='#475569')
        
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                   f'{int(height)}', ha='center', va='bottom', 
                   fontweight='bold', color='white', fontsize=9)
        
        for spine in ['top', 'right']:
            ax.spines[spine].set_visible(False)
        ax.spines['left'].set_color('#475569')
        ax.spines['bottom'].set_color('#475569')
        
        self.figure.tight_layout(pad=2.0)
    
    def plot_metric_analysis(self, metric: str):
        """Plot analysis for a specific metric - FIXED LAYOUT"""
        if metric not in self.current_data.columns:
            ax = self.figure.add_subplot(111)
            ax.set_facecolor('#1e293b')
            ax.text(0.5, 0.5, f'No "{metric}" column found in data', 
                   ha='center', va='center', transform=ax.transAxes,
                   color='#f59e0b', fontsize=14)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)
            return
        
        metric_color = {'Flowrate': '#3b82f6', 'Pressure': '#10b981', 
                       'Temperature': '#f59e0b'}.get(metric, '#3b82f6')
        
        has_type = 'Type' in self.current_data.columns
        data = self.current_data[metric].dropna()
        
        if len(data) == 0:
            ax = self.figure.add_subplot(111)
            ax.set_facecolor('#1e293b')
            ax.text(0.5, 0.5, f'No valid data for {metric}', 
                   ha='center', va='center', transform=ax.transAxes,
                   color='#f59e0b', fontsize=14)
            return
        
        # Create subplots with proper spacing
        if has_type:
            # 2 rows: top row has histogram and boxplot, bottom row has by-type comparison
            fig_height = self.figure.get_figheight()
            
            # Create axes manually with specific positions [left, bottom, width, height]
            ax1 = self.figure.add_axes([0.08, 0.58, 0.38, 0.35])  # Top left - histogram
            ax2 = self.figure.add_axes([0.55, 0.58, 0.38, 0.35])  # Top right - boxplot
            ax3 = self.figure.add_axes([0.08, 0.10, 0.85, 0.38])  # Bottom - by type
        else:
            # Just 2 plots side by side
            ax1 = self.figure.add_axes([0.08, 0.15, 0.40, 0.75])
            ax2 = self.figure.add_axes([0.55, 0.15, 0.40, 0.75])
        
        # Plot 1: Histogram
        ax1.set_facecolor('#1e293b')
        n_bins = min(20, max(5, len(data) // 3))
        ax1.hist(data, bins=n_bins, color=metric_color, edgecolor='white', alpha=0.85, linewidth=1)
        ax1.set_xlabel(metric, fontsize=9, fontweight='bold', color='#e2e8f0')
        ax1.set_ylabel('Frequency', fontsize=9, fontweight='bold', color='#e2e8f0')
        ax1.set_title(f'{metric} Distribution', fontsize=10, fontweight='bold', color='white', pad=8)
        ax1.tick_params(colors='#cbd5e1', labelsize=8)
        ax1.grid(alpha=0.2, color='#475569')
        for spine in ['top', 'right']:
            ax1.spines[spine].set_visible(False)
        ax1.spines['left'].set_color('#475569')
        ax1.spines['bottom'].set_color('#475569')
        
        # Plot 2: Box plot
        ax2.set_facecolor('#1e293b')
        bp = ax2.boxplot([data], vert=True, patch_artist=True, widths=0.5,
                        boxprops=dict(facecolor=metric_color, alpha=0.8, edgecolor='white', linewidth=1.5),
                        whiskerprops=dict(color='white', linewidth=1.5),
                        capprops=dict(color='white', linewidth=1.5),
                        medianprops=dict(color='#fbbf24', linewidth=2),
                        flierprops=dict(marker='o', markerfacecolor='#ef4444', markersize=5, alpha=0.7))
        ax2.set_ylabel(metric, fontsize=9, fontweight='bold', color='#e2e8f0')
        ax2.set_title(f'{metric} Box Plot', fontsize=10, fontweight='bold', color='white', pad=8)
        ax2.tick_params(colors='#cbd5e1', labelsize=8)
        ax2.set_xticklabels(['All Data'], color='#cbd5e1', fontsize=8)
        ax2.grid(alpha=0.2, color='#475569', axis='y')
        for spine in ['top', 'right']:
            ax2.spines[spine].set_visible(False)
        ax2.spines['left'].set_color('#475569')
        ax2.spines['bottom'].set_color('#475569')
        
        # Plot 3: By equipment type (if available)
        if has_type:
            ax3.set_facecolor('#1e293b')
            
            types = self.current_data['Type'].unique()
            data_by_type = []
            valid_types = []
            
            for t in types:
                type_data = self.current_data[self.current_data['Type'] == t][metric].dropna()
                if len(type_data) > 0:
                    data_by_type.append(type_data.values)
                    valid_types.append(str(t)[:12])  # Truncate long names
            
            if data_by_type:
                colors_palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                positions = range(1, len(data_by_type) + 1)
                
                bp = ax3.boxplot(data_by_type, positions=positions, patch_artist=True, widths=0.6,
                               boxprops=dict(alpha=0.8, edgecolor='white', linewidth=1.5),
                               whiskerprops=dict(color='white', linewidth=1.5),
                               capprops=dict(color='white', linewidth=1.5),
                               medianprops=dict(color='#fbbf24', linewidth=2),
                               flierprops=dict(marker='o', markerfacecolor='#ef4444', markersize=4, alpha=0.7))
                
                for i, patch in enumerate(bp['boxes']):
                    patch.set_facecolor(colors_palette[i % len(colors_palette)])
                
                ax3.set_xticks(positions)
                ax3.set_xticklabels(valid_types, rotation=20, ha='right', color='#cbd5e1', fontsize=8)
                ax3.set_xlabel('Equipment Type', fontsize=9, fontweight='bold', color='#e2e8f0')
                ax3.set_ylabel(metric, fontsize=9, fontweight='bold', color='#e2e8f0')
                ax3.set_title(f'{metric} by Equipment Type', fontsize=10, fontweight='bold', color='white', pad=8)
                ax3.tick_params(colors='#cbd5e1', labelsize=8)
                ax3.grid(alpha=0.2, color='#475569', axis='y')
                for spine in ['top', 'right']:
                    ax3.spines[spine].set_visible(False)
                ax3.spines['left'].set_color('#475569')
                ax3.spines['bottom'].set_color('#475569')
    
    def plot_correlation_heatmap(self):
        """Plot correlation heatmap for numeric columns"""
        numeric_cols = self.current_data.select_dtypes(include=['float64', 'int64']).columns
        
        if len(numeric_cols) < 2:
            ax = self.figure.add_subplot(111)
            ax.set_facecolor('#1e293b')
            ax.text(0.5, 0.5, 'Not enough numeric columns\nfor correlation analysis', 
                   ha='center', va='center', transform=ax.transAxes,
                   color='#f59e0b', fontsize=14)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)
            return
        
        # Limit columns to prevent crowding
        display_cols = list(numeric_cols)[:6]
        corr_matrix = self.current_data[display_cols].corr()
        
        ax = self.figure.add_subplot(111)
        ax.set_facecolor('#1e293b')
        
        im = ax.imshow(corr_matrix, cmap='RdYlBu_r', aspect='auto', vmin=-1, vmax=1)
        
        ax.set_xticks(np.arange(len(display_cols)))
        ax.set_yticks(np.arange(len(display_cols)))
        col_labels = [str(c)[:10] for c in display_cols]
        ax.set_xticklabels(col_labels, rotation=45, ha='right', color='#cbd5e1', fontsize=9)
        ax.set_yticklabels(col_labels, color='#cbd5e1', fontsize=9)
        
        cbar = self.figure.colorbar(im, ax=ax, shrink=0.8, pad=0.02)
        cbar.set_label('Correlation', rotation=270, labelpad=15, color='#e2e8f0', fontsize=10)
        cbar.ax.tick_params(colors='#cbd5e1', labelsize=8)
        
        # Add correlation values
        for i in range(len(display_cols)):
            for j in range(len(display_cols)):
                value = corr_matrix.iloc[i, j]
                text_color = 'white' if abs(value) > 0.5 else 'black'
                ax.text(j, i, f'{value:.2f}', ha='center', va='center', 
                       color=text_color, fontsize=9, fontweight='bold')
        
        ax.set_title('Correlation Heatmap', fontsize=13, fontweight='bold', pad=15, color='white')
        self.figure.tight_layout(pad=2.0)