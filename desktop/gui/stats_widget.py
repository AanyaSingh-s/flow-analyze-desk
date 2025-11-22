
from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                            QGridLayout, QFrame, QSizePolicy)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
import pandas as pd


class StatCard(QFrame):
    """A card widget to display a single statistic"""
    
    def __init__(self, title, value, icon="", color="#3b82f6"):
        super().__init__()
        darker = self.darken_color(color)
        self.setStyleSheet(f"""
            StatCard {{
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 {color}, 
                    stop:1 {darker});
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }}
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 14, 16, 14)
        layout.setSpacing(6)
        
        # Icon + Title row
        header_layout = QHBoxLayout()
        header_layout.setSpacing(8)
        
        if icon:
            icon_label = QLabel(icon)
            icon_label.setStyleSheet("color: rgba(255, 255, 255, 0.9); font-size: 20px; background: transparent;")
            header_layout.addWidget(icon_label)
        
        title_label = QLabel(title)
        title_label.setStyleSheet("""
            color: rgba(255, 255, 255, 0.9); 
            font-size: 12px; 
            font-weight: 600;
            background: transparent;
        """)
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        
        layout.addLayout(header_layout)
        
        # Value
        value_label = QLabel(str(value))
        value_font = QFont()
        value_font.setPointSize(24)
        value_font.setBold(True)
        value_label.setFont(value_font)
        value_label.setStyleSheet("color: white; background: transparent;")
        layout.addWidget(value_label)
        
        self.setMinimumHeight(90)
        self.setMaximumHeight(100)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    
    def darken_color(self, color):
        """Darken a hex color for gradient effect"""
        color = color.lstrip('#')
        rgb = tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
        darkened = tuple(max(0, c - 40) for c in rgb)
        return f"#{darkened[0]:02x}{darkened[1]:02x}{darkened[2]:02x}"


class StatsWidget(QWidget):
    """Widget to display summary statistics"""
    
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background: transparent;")
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.init_ui()
    
    def init_ui(self):
        """Initialize UI"""
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(8, 8, 8, 8)
        self.main_layout.setSpacing(16)
        
        # Title section
        title_frame = QFrame()
        title_frame.setStyleSheet("""
            QFrame {
                background: rgba(30, 41, 59, 0.7);
                border-radius: 8px;
            }
        """)
        title_layout = QVBoxLayout(title_frame)
        title_layout.setContentsMargins(16, 12, 16, 12)
        title_layout.setSpacing(4)
        
        title = QLabel("📊 Summary Statistics")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title.setFont(title_font)
        title.setStyleSheet("color: white; background: transparent;")
        title_layout.addWidget(title)
        
        subtitle = QLabel("Overview of your dataset metrics")
        subtitle.setStyleSheet("color: #94a3b8; font-size: 12px; background: transparent;")
        title_layout.addWidget(subtitle)
        
        self.main_layout.addWidget(title_frame)
        
        # Stats cards container
        self.cards_widget = QWidget()
        self.cards_widget.setStyleSheet("background: transparent;")
        self.cards_layout = QGridLayout(self.cards_widget)
        self.cards_layout.setSpacing(12)
        self.cards_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.addWidget(self.cards_widget)
        
        # Detailed stats container
        self.details_widget = QWidget()
        self.details_widget.setStyleSheet("background: transparent;")
        self.details_layout = QVBoxLayout(self.details_widget)
        self.details_layout.setSpacing(12)
        self.details_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.addWidget(self.details_widget)
        
        self.main_layout.addStretch()
    
    def clear_layout(self, layout):
        """Clear all widgets from a layout"""
        while layout.count():
            child = layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
    
    def update_stats(self, df: pd.DataFrame):
        """Update statistics display with new data"""
        # Clear existing widgets
        self.clear_layout(self.cards_layout)
        self.clear_layout(self.details_layout)
        
        if df is None or df.empty:
            no_data_label = QLabel("No data to display")
            no_data_label.setAlignment(Qt.AlignCenter)
            no_data_label.setStyleSheet("color: #94a3b8; font-size: 14px; padding: 30px; background: transparent;")
            self.cards_layout.addWidget(no_data_label, 0, 0)
            return
        
        # Create stat cards
        cards = [
            ("Total Records", len(df), "📝", "#3b82f6"),
            ("Columns", len(df.columns), "📋", "#10b981"),
        ]
        
        # Check for Type column
        if 'Type' in df.columns:
            cards.append(("Equipment Types", df['Type'].nunique(), "⚙️", "#f59e0b"))
        
        # Add numeric columns count
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        cards.append(("Numeric Fields", len(numeric_cols), "🔢", "#8b5cf6"))
        
        # Create cards in grid (2 columns for better fit)
        for i, (title, value, icon, color) in enumerate(cards):
            card = StatCard(title, value, icon, color)
            row = i // 2
            col = i % 2
            self.cards_layout.addWidget(card, row, col)
        
        # Detailed statistics section
        if len(numeric_cols) > 0:
            self.add_detailed_stats(df, numeric_cols)
        
        # Equipment type distribution
        if 'Type' in df.columns:
            self.add_type_distribution(df)
    
    def add_detailed_stats(self, df, numeric_cols):
        """Add detailed statistics table"""
        details_frame = QFrame()
        details_frame.setStyleSheet("""
            QFrame {
                background: rgba(30, 41, 59, 0.7);
                border-radius: 8px;
            }
        """)
        details_layout = QVBoxLayout(details_frame)
        details_layout.setContentsMargins(16, 12, 16, 12)
        details_layout.setSpacing(12)
        
        # Title
        details_title = QLabel("📈 Detailed Statistics")
        details_font = QFont()
        details_font.setPointSize(14)
        details_font.setBold(True)
        details_title.setFont(details_font)
        details_title.setStyleSheet("color: white; background: transparent;")
        details_layout.addWidget(details_title)
        
        # Stats table
        stats_grid = QGridLayout()
        stats_grid.setSpacing(6)
        stats_grid.setContentsMargins(0, 0, 0, 0)
        
        # Limit columns to prevent overflow
        display_cols = list(numeric_cols)[:5]
        
        # Headers
        headers = ['Metric'] + [str(col)[:12] for col in display_cols]
        for j, header in enumerate(headers):
            label = QLabel(header)
            label.setStyleSheet("""
                font-weight: bold; 
                color: #3b82f6;
                padding: 6px 4px;
                font-size: 11px;
                background: transparent;
            """)
            label.setAlignment(Qt.AlignCenter if j > 0 else Qt.AlignLeft)
            stats_grid.addWidget(label, 0, j)
        
        # Stats rows
        stat_configs = [
            ('Mean', lambda col: df[col].mean(), "#10b981"),
            ('Median', lambda col: df[col].median(), "#3b82f6"),
            ('Std Dev', lambda col: df[col].std(), "#f59e0b"),
            ('Min', lambda col: df[col].min(), "#ef4444"),
            ('Max', lambda col: df[col].max(), "#8b5cf6"),
        ]
        
        for i, (stat_name, stat_func, color) in enumerate(stat_configs, 1):
            name_label = QLabel(stat_name)
            name_label.setStyleSheet(f"""
                font-weight: 600; 
                color: {color};
                padding: 4px;
                font-size: 11px;
                background: transparent;
            """)
            stats_grid.addWidget(name_label, i, 0)
            
            for j, col in enumerate(display_cols, 1):
                try:
                    value = stat_func(col)
                    if abs(value) >= 1000:
                        text = f"{value:.1f}"
                    else:
                        text = f"{value:.2f}"
                    value_label = QLabel(text)
                    value_label.setStyleSheet("""
                        padding: 4px;
                        color: #e2e8f0;
                        font-size: 11px;
                        background: transparent;
                    """)
                    value_label.setAlignment(Qt.AlignCenter)
                    stats_grid.addWidget(value_label, i, j)
                except:
                    value_label = QLabel("N/A")
                    value_label.setStyleSheet("padding: 4px; color: #64748b; font-size: 11px; background: transparent;")
                    value_label.setAlignment(Qt.AlignCenter)
                    stats_grid.addWidget(value_label, i, j)
        
        details_layout.addLayout(stats_grid)
        self.details_layout.addWidget(details_frame)
    
    def add_type_distribution(self, df):
        """Add equipment type distribution"""
        type_frame = QFrame()
        type_frame.setStyleSheet("""
            QFrame {
                background: rgba(30, 41, 59, 0.7);
                border-radius: 8px;
            }
        """)
        type_layout = QVBoxLayout(type_frame)
        type_layout.setContentsMargins(16, 12, 16, 12)
        type_layout.setSpacing(10)
        
        # Title
        type_title = QLabel("⚙️ Equipment Distribution")
        type_font = QFont()
        type_font.setPointSize(14)
        type_font.setBold(True)
        type_title.setFont(type_font)
        type_title.setStyleSheet("color: white; background: transparent;")
        type_layout.addWidget(type_title)
        
        # Distribution
        type_counts = df['Type'].value_counts()
        total = len(df)
        colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
        
        for i, (eq_type, count) in enumerate(type_counts.items()):
            percentage = (count / total) * 100
            color = colors[i % len(colors)]
            
            row_widget = QWidget()
            row_widget.setStyleSheet("background: transparent;")
            row_layout = QHBoxLayout(row_widget)
            row_layout.setContentsMargins(0, 2, 0, 2)
            row_layout.setSpacing(10)
            
            # Type name
            type_label = QLabel(f"● {eq_type}")
            type_label.setStyleSheet(f"color: {color}; font-size: 12px; min-width: 120px; background: transparent;")
            row_layout.addWidget(type_label)
            
            # Count
            count_label = QLabel(str(count))
            count_label.setStyleSheet("color: #e2e8f0; font-size: 12px; min-width: 40px; background: transparent;")
            count_label.setAlignment(Qt.AlignCenter)
            row_layout.addWidget(count_label)
            
            # Progress bar
            bar_container = QWidget()
            bar_container.setStyleSheet("background: transparent;")
            bar_container.setMinimumWidth(150)
            bar_layout = QHBoxLayout(bar_container)
            bar_layout.setContentsMargins(0, 0, 0, 0)
            bar_layout.setSpacing(6)
            
            bar = QFrame()
            bar_width = int(min(percentage * 1.5, 150))
            bar.setFixedSize(bar_width, 14)
            bar.setStyleSheet(f"""
                QFrame {{
                    background: {color};
                    border-radius: 4px;
                }}
            """)
            bar_layout.addWidget(bar)
            bar_layout.addStretch()
            
            row_layout.addWidget(bar_container)
            
            # Percentage
            pct_label = QLabel(f"{percentage:.1f}%")
            pct_label.setStyleSheet("color: #94a3b8; font-size: 11px; min-width: 50px; background: transparent;")
            pct_label.setAlignment(Qt.AlignRight)
            row_layout.addWidget(pct_label)
            
            row_layout.addStretch()
            type_layout.addWidget(row_widget)
        
        self.details_layout.addWidget(type_frame)
