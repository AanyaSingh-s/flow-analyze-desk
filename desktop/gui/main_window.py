# desktop/gui/main_window.py
from PyQt5.QtGui import QFont
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QTabWidget, QMessageBox,
    QFileDialog, QTableWidget, QTableWidgetItem,
    QHeaderView, QStatusBar, QAction, QStackedWidget,
    QScrollArea, QFrame, QSizePolicy
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal
import pandas as pd
import sys
import traceback
import os

from api.client import APIClient
from gui.login_dialog import LoginDialog
from gui.stats_widget import StatsWidget
from gui.charts_widget import ChartsWidget
from gui.animated_background import AnimatedBackground
from gui.index_page import IndexPage


class UploadThread(QThread):
    """Background thread for uploading files"""
    finished = pyqtSignal(dict)
    error = pyqtSignal(str)

    def __init__(self, api_client, file_path):
        super().__init__()
        self.api_client = api_client
        self.file_path = file_path

    def run(self):
        try:
            result = self.api_client.upload_csv(self.file_path)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        
        sys.excepthook = self.exception_handler
        
        self.api_client = APIClient()
        self.current_data = None
        self.current_dataset_id = None
        self.user = None

        self.setWindowTitle("ChemFlow Analytics - Chemical Equipment Intelligence")
        self.setGeometry(50, 50, 1400, 900)
        self.setMinimumSize(1200, 800)

        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")
        self.status_bar.setStyleSheet("""
            QStatusBar {
                background: rgba(15, 23, 42, 0.95);
                color: #e2e8f0;
                border-top: 1px solid rgba(148, 163, 184, 0.3);
                padding: 4px 8px;
                font-size: 12px;
            }
        """)

        # Stacked widget
        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)

        # Pages
        self.index_page = IndexPage(self)
        self.dashboard_page = self.create_dashboard_page()

        self.stacked_widget.addWidget(self.index_page)
        self.stacked_widget.addWidget(self.dashboard_page)

        # Menu bar
        self.create_menu_bar()

        # Show index page first
        self.show_index_page()

    def exception_handler(self, exc_type, exc_value, exc_traceback):
        """Global exception handler"""
        if issubclass(exc_type, KeyboardInterrupt):
            sys.__excepthook__(exc_type, exc_value, exc_traceback)
            return

        error_msg = ''.join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        print(f"Uncaught exception:\n{error_msg}")
        
        QMessageBox.critical(
            self,
            "Application Error",
            f"An unexpected error occurred:\n\n{exc_value}\n\nThe application will continue running."
        )

    def show_index_page(self):
        """Show landing page"""
        self.stacked_widget.setCurrentWidget(self.index_page)
        self.menuBar().hide()
        self.status_bar.hide()

    def show_dashboard_page(self):
        """Show dashboard"""
        self.stacked_widget.setCurrentWidget(self.dashboard_page)
        self.menuBar().show()
        self.status_bar.show()
        self.update_ui_state()
        
        if self.api_client.token:
            self.load_history()

    def create_dashboard_page(self):
        """Create dashboard with properly centered and spaced tabs"""
        root_container = QWidget()
        root_layout = QVBoxLayout(root_container)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # Background
        self.background = AnimatedBackground(root_container)
        self.background.setGeometry(0, 0, 4000, 4000)
        self.background.lower()

        # Main content wrapper
        content = QWidget()
        content.setStyleSheet("background: transparent;")
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(20, 15, 20, 15)
        content_layout.setSpacing(12)

        # Header
        header_frame = QFrame()
        header_frame.setStyleSheet("""
            QFrame {
                background: rgba(15, 23, 42, 0.8);
                border-radius: 10px;
                border: 1px solid rgba(148, 163, 184, 0.2);
            }
        """)
        header_layout = QHBoxLayout(header_frame)
        header_layout.setContentsMargins(20, 12, 20, 12)
        
        title_label = QLabel("ChemFlow Analytics")
        title_font = QFont()
        title_font.setPointSize(16)
        title_font.setBold(True)
        title_label.setFont(title_font)
        title_label.setStyleSheet("color: white; background: transparent;")
        header_layout.addWidget(title_label)

        header_layout.addStretch()

        self.user_label = QLabel("Not logged in")
        self.user_label.setStyleSheet("""
            color: #cbd5e1; 
            font-size: 13px;
            padding: 6px 12px;
            background: rgba(30, 41, 59, 0.6);
            border-radius: 6px;
        """)
        header_layout.addWidget(self.user_label)

        self.logout_btn = QPushButton("Logout")
        self.logout_btn.clicked.connect(self.logout)
        self.logout_btn.setVisible(False)
        self.logout_btn.setCursor(Qt.PointingHandCursor)
        self.logout_btn.setStyleSheet("""
            QPushButton {
                background: #ef4444;
                color: white;
                border-radius: 6px;
                padding: 6px 14px;
                font-size: 13px;
                font-weight: 600;
                border: none;
            }
            QPushButton:hover { background: #dc2626; }
        """)
        header_layout.addWidget(self.logout_btn)

        content_layout.addWidget(header_frame)

        # Upload controls
        controls_frame = QFrame()
        controls_frame.setStyleSheet("""
            QFrame {
                background: rgba(15, 23, 42, 0.6);
                border-radius: 8px;
                border: 1px solid rgba(148, 163, 184, 0.15);
            }
        """)
        upload_layout = QHBoxLayout(controls_frame)
        upload_layout.setContentsMargins(16, 10, 16, 10)
        upload_layout.setSpacing(12)

        self.upload_btn = QPushButton("📤 Upload CSV File")
        self.upload_btn.setMinimumHeight(40)
        self.upload_btn.setMinimumWidth(160)
        self.upload_btn.setCursor(Qt.PointingHandCursor)
        self.upload_btn.clicked.connect(self.upload_file)
        self.upload_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #3b82f6, stop:1 #2563eb);
                color: white;
                border-radius: 8px;
                padding: 8px 20px;
                font-size: 13px;
                font-weight: 600;
                border: none;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #2563eb, stop:1 #1d4ed8);
            }
        """)
        upload_layout.addWidget(self.upload_btn)

        self.generate_report_btn = QPushButton("📄 Generate Report")
        self.generate_report_btn.setMinimumHeight(40)
        self.generate_report_btn.setMinimumWidth(160)
        self.generate_report_btn.setCursor(Qt.PointingHandCursor)
        self.generate_report_btn.clicked.connect(self.generate_report)
        self.generate_report_btn.setEnabled(False)
        self.generate_report_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #10b981, stop:1 #059669);
                color: white;
                border-radius: 8px;
                padding: 8px 20px;
                font-size: 13px;
                font-weight: 600;
                border: none;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #059669, stop:1 #047857);
            }
            QPushButton:disabled {
                background: #4b5563;
                color: #9ca3af;
            }
        """)
        upload_layout.addWidget(self.generate_report_btn)

        upload_layout.addStretch()
        content_layout.addWidget(controls_frame)

        # Tab widget - takes remaining space
        self.tabs = QTabWidget()
        self.tabs.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.tabs.setStyleSheet("""
            QTabWidget::pane {
                border: 1px solid rgba(148, 163, 184, 0.25);
                border-radius: 8px;
                background: rgba(15, 23, 42, 0.85);
                padding: 8px;
            }
            
            QTabBar::tab {
                background: rgba(30, 41, 59, 0.8);
                color: #cbd5e1;
                border: 1px solid rgba(148, 163, 184, 0.25);
                border-bottom: none;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                padding: 10px 20px;
                margin-right: 3px;
                font-size: 13px;
                font-weight: 600;
            }
            
            QTabBar::tab:selected {
                background: rgba(59, 130, 246, 0.3);
                color: white;
                border: 1px solid #3b82f6;
                border-bottom: none;
            }
            
            QTabBar::tab:hover:!selected {
                background: rgba(59, 130, 246, 0.15);
            }
        """)

        # Stats tab
        self.stats_widget = StatsWidget()
        stats_scroll = QScrollArea()
        stats_scroll.setWidget(self.stats_widget)
        stats_scroll.setWidgetResizable(True)
        stats_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        stats_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        stats_scroll.setFrameShape(QFrame.NoFrame)
        stats_scroll.setStyleSheet("background: transparent; border: none;")
        self.tabs.addTab(stats_scroll, "📊 Statistics")

        # Charts tab
        self.charts_widget = ChartsWidget()
        charts_scroll = QScrollArea()
        charts_scroll.setWidget(self.charts_widget)
        charts_scroll.setWidgetResizable(True)
        charts_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        charts_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        charts_scroll.setFrameShape(QFrame.NoFrame)
        charts_scroll.setStyleSheet("background: transparent; border: none;")
        self.tabs.addTab(charts_scroll, "📈 Charts")

        # Data table
        self.table_widget = QTableWidget()
        self.table_widget.setAlternatingRowColors(True)
        self.table_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.table_widget.setStyleSheet("""
            QTableWidget {
                background: rgba(15, 23, 42, 0.95);
                border: none;
                border-radius: 6px;
                gridline-color: rgba(148, 163, 184, 0.15);
                color: #e2e8f0;
                font-size: 12px;
            }
            
            QTableWidget::item {
                padding: 8px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            }
            
            QTableWidget::item:selected {
                background: rgba(59, 130, 246, 0.4);
                color: white;
            }
            
            QTableWidget::item:alternate {
                background: rgba(30, 41, 59, 0.4);
            }
            
            QHeaderView::section {
                background: rgba(30, 41, 59, 0.95);
                color: white;
                border: none;
                border-bottom: 2px solid #3b82f6;
                padding: 10px 8px;
                font-weight: bold;
                font-size: 12px;
            }
        """)
        self.tabs.addTab(self.table_widget, "📋 Data Table")

        # History tab
        self.history_table = QTableWidget()
        self.history_table.setColumnCount(4)
        self.history_table.setHorizontalHeaderLabels(
            ["Filename", "Records", "Date", "Action"]
        )
        self.history_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        self.history_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        self.history_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeToContents)
        self.history_table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeToContents)
        self.history_table.setAlternatingRowColors(True)
        self.history_table.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.history_table.setStyleSheet("""
            QTableWidget {
                background: rgba(15, 23, 42, 0.95);
                border: none;
                border-radius: 6px;
                gridline-color: rgba(148, 163, 184, 0.15);
                color: #e2e8f0;
                font-size: 12px;
            }
            
            QTableWidget::item {
                padding: 8px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            }
            
            QTableWidget::item:selected {
                background: rgba(59, 130, 246, 0.4);
                color: white;
            }
            
            QTableWidget::item:alternate {
                background: rgba(30, 41, 59, 0.4);
            }
            
            QHeaderView::section {
                background: rgba(30, 41, 59, 0.95);
                color: white;
                border: none;
                border-bottom: 2px solid #3b82f6;
                padding: 10px 8px;
                font-weight: bold;
                font-size: 12px;
            }
        """)
        self.tabs.addTab(self.history_table, "🕐 History")

        content_layout.addWidget(self.tabs, 1)  # Give tabs stretch factor

        root_layout.addWidget(content)
        root_container.resizeEvent = lambda event: self.on_dashboard_resize(event)

        return root_container

    def on_dashboard_resize(self, event):
        """Handle resize"""
        if hasattr(self, 'background'):
            self.background.setGeometry(0, 0, event.size().width(), event.size().height())
        event.accept()

    def create_menu_bar(self):
        """Create menu bar"""
        menubar = self.menuBar()
        menubar.setStyleSheet("""
            QMenuBar {
                background: rgba(15, 23, 42, 0.95);
                color: white;
                border-bottom: 1px solid rgba(148, 163, 184, 0.3);
                padding: 4px;
                font-size: 13px;
            }
            QMenuBar::item {
                padding: 6px 12px;
                background: transparent;
                border-radius: 4px;
            }
            QMenuBar::item:selected {
                background: rgba(59, 130, 246, 0.3);
            }
            QMenu {
                background: rgba(15, 23, 42, 0.98);
                border: 1px solid rgba(148, 163, 184, 0.3);
                border-radius: 6px;
                color: white;
                padding: 4px;
            }
            QMenu::item {
                padding: 8px 24px;
                border-radius: 4px;
            }
            QMenu::item:selected {
                background: rgba(59, 130, 246, 0.3);
            }
        """)

        file_menu = menubar.addMenu("File")
        upload_action = QAction("Upload CSV", self)
        upload_action.setShortcut("Ctrl+O")
        upload_action.triggered.connect(self.upload_file)
        file_menu.addAction(upload_action)
        file_menu.addSeparator()
        exit_action = QAction("Exit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        account_menu = menubar.addMenu("Account")
        login_action = QAction("Login", self)
        login_action.triggered.connect(self.show_login)
        account_menu.addAction(login_action)
        logout_action = QAction("Logout", self)
        logout_action.triggered.connect(self.logout)
        account_menu.addAction(logout_action)

        help_menu = menubar.addMenu("Help")
        about_action = QAction("About", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def show_login(self):
        """Show login dialog"""
        dialog = LoginDialog(self.api_client, self, start_with_register=False)
        if dialog.exec_():
            user = dialog.user_data
            if user:
                self.user = user
                username = user.get('username', 'User')
                self.user_label.setText(f"Welcome, {username}")
                self.logout_btn.setVisible(True)
                self.status_bar.showMessage(f"Logged in as {username}")
                
                if self.stacked_widget.currentWidget() == self.index_page:
                    self.show_dashboard_page()
                else:
                    self.load_history()

    def logout(self):
        """Logout"""
        try:
            self.api_client.logout()
        except Exception as e:
            print(f"Logout error: {e}")
        
        self.user = None
        self.user_label.setText("Not logged in")
        self.logout_btn.setVisible(False)
        self.history_table.setRowCount(0)
        self.status_bar.showMessage("Logged out")
        self.current_dataset_id = None
        self.generate_report_btn.setEnabled(False)

    def update_ui_state(self):
        """Update UI state"""
        is_logged_in = self.api_client.token is not None
        
        if is_logged_in and self.user:
            username = self.user.get('username', 'User')
            self.user_label.setText(f"Welcome, {username}")
            self.logout_btn.setVisible(True)
        else:
            self.user_label.setText("Not logged in")
            self.logout_btn.setVisible(False)

    def upload_file(self):
        """Upload file with proper path handling"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Select CSV File", "", "CSV Files (*.csv);;All Files (*)"
        )

        if not file_path:
            return

        # Normalize path for cross-platform compatibility
        file_path = os.path.normpath(file_path)
        
        try:
            # Read CSV with error handling
            df = pd.read_csv(file_path, encoding='utf-8')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(file_path, encoding='latin-1')
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to read CSV:\n\n{str(e)}")
                return
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load CSV:\n\n{str(e)}")
            return

        if df.empty:
            QMessageBox.warning(self, "Empty File", "The CSV file is empty.")
            return
        
        self.current_data = df
        self.display_data(df)
        self.status_bar.showMessage(f"Loaded {len(df)} records from {os.path.basename(file_path)}")

        if self.api_client.token:
            self.upload_to_backend(file_path)
        else:
            QMessageBox.information(
                self, "Local Mode",
                f"File loaded locally with {len(df)} records.\nLogin to sync with backend and save your data."
            )

    def upload_to_backend(self, file_path):
        """Upload to backend"""
        self.status_bar.showMessage("Uploading to server...")
        self.upload_btn.setEnabled(False)

        self.upload_thread = UploadThread(self.api_client, file_path)
        self.upload_thread.finished.connect(self.on_upload_finished)
        self.upload_thread.error.connect(self.on_upload_error)
        self.upload_thread.start()

    def on_upload_finished(self, result):
        """Upload finished"""
        self.upload_btn.setEnabled(True)
        dataset = result.get("dataset", {})
        self.current_dataset_id = dataset.get("id")
        
        if self.current_dataset_id:
            self.generate_report_btn.setEnabled(True)
        
        self.status_bar.showMessage("Upload successful! Data synced with server.")
        self.load_history()
        QMessageBox.information(self, "Success", "File uploaded and synced successfully!")

    def on_upload_error(self, error_msg):
        """Upload error"""
        self.upload_btn.setEnabled(True)
        self.status_bar.showMessage("Upload failed - data saved locally only")
        QMessageBox.warning(
            self, 
            "Upload Error", 
            f"Failed to upload to server:\n\n{error_msg}\n\nYour data is still available locally."
        )

    def display_data(self, df):
        """Display data in all tabs"""
        try:
            # Update stats widget
            self.stats_widget.update_stats(df)
            
            # Update charts widget
            self.charts_widget.update_charts(df)
            
            # Update data table
            self.table_widget.clear()
            self.table_widget.setRowCount(len(df))
            self.table_widget.setColumnCount(len(df.columns))
            self.table_widget.setHorizontalHeaderLabels(df.columns.tolist())

            for i in range(len(df)):
                for j, col in enumerate(df.columns):
                    value = df.iloc[i, j]
                    item = QTableWidgetItem(str(value) if pd.notna(value) else "")
                    item.setTextAlignment(Qt.AlignCenter)
                    self.table_widget.setItem(i, j, item)

            # Resize columns to fit content then stretch
            self.table_widget.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
            self.table_widget.verticalHeader().setDefaultSectionSize(36)
            
            self.status_bar.showMessage(f"Displaying {len(df)} records with {len(df.columns)} columns")
            
            # Switch to stats tab to show results
            self.tabs.setCurrentIndex(0)
            
        except Exception as e:
            print(f"Display error: {e}")
            traceback.print_exc()
            QMessageBox.warning(self, "Display Error", f"Error displaying data:\n\n{str(e)}")

    def load_history(self):
        """Load history from server"""
        if not self.api_client.token:
            return

        try:
            result = self.api_client.get_history()
            datasets = result.get("results", result) if isinstance(result, dict) else result
            
            if isinstance(datasets, dict):
                datasets = datasets.get("results", [])
            
            if not isinstance(datasets, list):
                datasets = []

            self.history_table.setRowCount(len(datasets))
            self.history_table.verticalHeader().setDefaultSectionSize(45)

            for i, dataset in enumerate(datasets):
                if not isinstance(dataset, dict):
                    continue
                    
                filename = dataset.get("filename", "N/A")
                records = str(dataset.get("total_records", dataset.get("row_count", 0)))
                date = dataset.get("uploaded_at", dataset.get("created_at", ""))[:10]
                
                # Filename
                filename_item = QTableWidgetItem(filename)
                filename_item.setTextAlignment(Qt.AlignLeft | Qt.AlignVCenter)
                self.history_table.setItem(i, 0, filename_item)
                
                # Records
                records_item = QTableWidgetItem(records)
                records_item.setTextAlignment(Qt.AlignCenter)
                self.history_table.setItem(i, 1, records_item)
                
                # Date
                date_item = QTableWidgetItem(date)
                date_item.setTextAlignment(Qt.AlignCenter)
                self.history_table.setItem(i, 2, date_item)

                # View button
                view_btn = QPushButton("View")
                view_btn.setCursor(Qt.PointingHandCursor)
                view_btn.setStyleSheet("""
                    QPushButton {
                        background: #3b82f6;
                        color: white;
                        border-radius: 4px;
                        padding: 6px 16px;
                        font-size: 12px;
                        font-weight: 600;
                        border: none;
                    }
                    QPushButton:hover { background: #2563eb; }
                """)
                
                dataset_id = dataset.get("id")
                view_btn.clicked.connect(
                    lambda checked, ds_id=dataset_id: self.load_dataset(ds_id)
                )
                self.history_table.setCellWidget(i, 3, view_btn)
                
            self.status_bar.showMessage(f"Loaded {len(datasets)} datasets from history")

        except Exception as e:
            print(f"History error: {e}")
            traceback.print_exc()
            self.status_bar.showMessage("Failed to load history")

    def load_dataset(self, dataset_id):
        """Load dataset from server"""
        if not dataset_id:
            return
            
        try:
            self.status_bar.showMessage("Loading dataset...")
            result = self.api_client.get_dataset_data(dataset_id)
            data = result.get("data", result.get("rows", []))
            
            if not data:
                QMessageBox.information(self, "No Data", "Dataset is empty.")
                return
            
            df = pd.DataFrame(data)
            if not df.empty:
                self.current_data = df
                self.current_dataset_id = dataset_id
                self.display_data(df)
                self.generate_report_btn.setEnabled(True)
                self.tabs.setCurrentIndex(0)
                self.status_bar.showMessage(f"Loaded dataset with {len(df)} records")

        except Exception as e:
            print(f"Load dataset error: {e}")
            QMessageBox.warning(self, "Error", f"Failed to load dataset:\n\n{str(e)}")

    def generate_report(self):
        """Generate report"""
        if not self.current_dataset_id:
            QMessageBox.warning(self, "No Dataset", "Please upload a file first.")
            return

        if not self.api_client.token:
            QMessageBox.warning(self, "Login Required", "Please login to generate reports.")
            return

        try:
            self.status_bar.showMessage("Generating report...")
            self.generate_report_btn.setEnabled(False)
            
            result = self.api_client.generate_report(self.current_dataset_id)
            report = result.get("report", {})
            report_url = report.get("report_url", report.get("url", "Report generated"))

            self.generate_report_btn.setEnabled(True)
            self.status_bar.showMessage("Report generated successfully!")
            QMessageBox.information(self, "Success", f"Report generated!\n\n{report_url}")

        except Exception as e:
            self.generate_report_btn.setEnabled(True)
            self.status_bar.showMessage("Report generation failed")
            QMessageBox.critical(self, "Error", f"Failed to generate report:\n\n{str(e)}")

    def show_about(self):
        """About dialog"""
        QMessageBox.about(
            self, "About ChemFlow Analytics",
            "<h3>ChemFlow Analytics</h3>"
            "<p>Chemical Equipment Intelligence Platform</p>"
            "<p>Version 1.0.0</p>"
            "<p>Upload, analyze, and visualize chemical equipment datasets.</p>"
        )

    def closeEvent(self, event):
        """Close event"""
        reply = QMessageBox.question(
            self, 'Exit Application', 
            'Are you sure you want to exit?',
            QMessageBox.Yes | QMessageBox.No, 
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            if hasattr(self, 'background'):
                self.background.timer.stop()
            event.accept()
        else:
            event.ignore()