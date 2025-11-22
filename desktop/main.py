import sys
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import Qt
from gui.main_window import MainWindow
def main():
    # Enable high DPI scaling
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
    
    app = QApplication(sys.argv)
    
    # Set global stylesheet matching your web app
    app.setStyleSheet("""
        QMainWindow {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #0f172a,
                stop:0.5 #1e293b,
                stop:1 #0f172a);
        }
        
        QWidget {
            color: #f8fafc;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
        }
        
        QPushButton {
            background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                stop:0 #3b82f6,
                stop:1 #2563eb);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-weight: bold;
            font-size: 14px;
        }
        
        QPushButton:hover {
            background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                stop:0 #2563eb,
                stop:1 #1d4ed8);
        }
        
        QPushButton:pressed {
            background: #1e40af;
        }
        
        QPushButton:disabled {
            background: #64748b;
            color: #94a3b8;
        }
        
        QLineEdit {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 8px;
            padding: 10px;
            color: white;
            selection-background-color: #3b82f6;
        }
        
        QLineEdit:focus {
            border: 2px solid #3b82f6;
        }
        
        QLabel {
            color: #f8fafc;
        }
        
        QTabWidget::pane {
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 12px;
            background: rgba(15, 23, 42, 0.7);
            padding: 10px;
        }
        
        QTabBar::tab {
            background: rgba(30, 41, 59, 0.5);
            color: #cbd5e1;
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-bottom: none;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            padding: 12px 24px;
            margin-right: 4px;
        }
        
        QTabBar::tab:selected {
            background: rgba(59, 130, 246, 0.2);
            color: white;
            border: 1px solid #3b82f6;
            border-bottom: none;
        }
        
        QTabBar::tab:hover {
            background: rgba(59, 130, 246, 0.1);
        }
        
        QTableWidget {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            gridline-color: rgba(148, 163, 184, 0.1);
            color: white;
        }
        
        QTableWidget::item {
            padding: 8px;
        }
        
        QTableWidget::item:selected {
            background: rgba(59, 130, 246, 0.3);
        }
        
        QHeaderView::section {
            background: rgba(30, 41, 59, 0.8);
            color: white;
            border: none;
            padding: 10px;
            font-weight: bold;
        }
        
        QScrollBar:vertical {
            background: rgba(30, 41, 59, 0.5);
            width: 12px;
            border-radius: 6px;
        }
        
        QScrollBar::handle:vertical {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 6px;
            min-height: 30px;
        }
        
        QScrollBar::handle:vertical:hover {
            background: rgba(59, 130, 246, 0.7);
        }
        
        QScrollBar:horizontal {
            background: rgba(30, 41, 59, 0.5);
            height: 12px;
            border-radius: 6px;
        }
        
        QScrollBar::handle:horizontal {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 6px;
            min-width: 30px;
        }
        
        QMenuBar {
            background: rgba(15, 23, 42, 0.9);
            color: white;
            border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        
        QMenuBar::item {
            padding: 8px 12px;
            background: transparent;
        }
        
        QMenuBar::item:selected {
            background: rgba(59, 130, 246, 0.2);
        }
        
        QMenu {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            color: white;
        }
        
        QMenu::item {
            padding: 8px 24px;
        }
        
        QMenu::item:selected {
            background: rgba(59, 130, 246, 0.3);
        }
        
        QStatusBar {
            background: rgba(15, 23, 42, 0.9);
            color: #cbd5e1;
            border-top: 1px solid rgba(148, 163, 184, 0.2);
        }
        
        QDialog {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #0f172a,
                stop:0.5 #1e293b,
                stop:1 #0f172a);
        }
        
        QComboBox {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 8px;
            padding: 8px;
            color: white;
        }
        
        QComboBox:hover {
            border: 1px solid #3b82f6;
        }
        
        QComboBox::drop-down {
            border: none;
        }
        
        QComboBox QAbstractItemView {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            selection-background-color: rgba(59, 130, 246, 0.3);
            color: white;
        }
    """)
    
    # Set application metadata
    app.setApplicationName("Chemical Equipment Analyzer")
    app.setOrganizationName("ChemFlow Analytics")
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
