# desktop/gui/index_page.py
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QSizePolicy, QSpacerItem
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

from gui.animated_background import AnimatedBackground


class IndexPage(AnimatedBackground):
    
    def __init__(self, main_window=None):
        super().__init__(main_window)

        self.main_window = main_window

        # ============================================================
        # MAIN ROOT LAYOUT
        # ============================================================
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # --------- CENTERED CONTAINER (like max-w-7xl) ---------
        container = QFrame()
        container.setStyleSheet("""
            QFrame {
                background: transparent;
            }
        """)
        container_layout = QVBoxLayout(container)
        container_layout.setContentsMargins(60, 40, 60, 40)
        container_layout.setSpacing(40)

        root.addWidget(container, 0, Qt.AlignTop | Qt.AlignHCenter)
        container.setMaximumWidth(1400)    
        # ============================================================
        # NAVBAR
        # ============================================================
        nav = QHBoxLayout()
        nav.setSpacing(20)

        brand = QLabel(
            "<span style='font-size:10px; letter-spacing:2px; "
            "color:#bfdbfe;'>CHEMFLOW ANALYTICS</span><br>"
            "<span style='font-size:20px; font-weight:800; color:white;'>"
            "Chemical Equipment Intelligence</span>"
        )
        nav.addWidget(brand)
        nav.addStretch()

        self.btn_login = QPushButton("Log In")
        self.btn_login.setCursor(Qt.PointingHandCursor)
        self.btn_login.setStyleSheet(self._nav_button())
        nav.addWidget(self.btn_login)

        self.btn_get_started = QPushButton("Get Started")
        self.btn_get_started.setCursor(Qt.PointingHandCursor)
        self.btn_get_started.setStyleSheet(self._nav_button(primary=True))
        nav.addWidget(self.btn_get_started)

        container_layout.addLayout(nav)

        # ============================================================
        # HERO SECTION
        # ============================================================
        hero = QHBoxLayout()
        hero.setSpacing(40)

        # ---------------- LEFT SIDE ----------------
        left = QVBoxLayout()
        left.setSpacing(25)

        pill = QLabel(
            "<span style='color:#22c55e;'>●</span> "
            "<span style='color:#e5e7eb;'>Real-time CSV analytics for modern process labs</span>"
        )
        pill.setStyleSheet("""
            background: rgba(15,23,42,0.70);
            padding: 6px 16px;
            border-radius: 20px;
        """)
        left.addWidget(pill, 0, Qt.AlignLeft)

        heading = QLabel(
            "Upload, analyze, and\nvisualize chemical\nequipment datasets in\nseconds."
        )
        heading.setStyleSheet("color:white; font-size:28px; font-weight:800;")
        heading.setWordWrap(True)
        left.addWidget(heading)

        subtitle = QLabel(
            "Flow-rate trends, pressure deviations, temperature correlations, and more. "
            "Unlock insights from every CSV using interactive dashboards built for "
            "process engineers and researchers."
        )
        subtitle.setWordWrap(True)
        subtitle.setStyleSheet("color:#d1d5db; font-size:15px;")
        left.addWidget(subtitle)

        # Buttons
        ctas = QHBoxLayout()
        ctas.setSpacing(20)

        self.btn_create_workspace = QPushButton("Create your workspace")
        self.btn_create_workspace.setMinimumHeight(42)
        self.btn_create_workspace.setCursor(Qt.PointingHandCursor)
        self.btn_create_workspace.setStyleSheet(self._cta_primary())
        ctas.addWidget(self.btn_create_workspace)

        self.btn_view_dashboard = QPushButton("View dashboard")
        self.btn_view_dashboard.setMinimumHeight(42)
        self.btn_view_dashboard.setCursor(Qt.PointingHandCursor)
        self.btn_view_dashboard.setStyleSheet(self._cta_secondary())
        ctas.addWidget(self.btn_view_dashboard)

        left.addLayout(ctas)
        hero.addLayout(left, 2)

        # ---------------- RIGHT SIDE CARD PANEL ----------------
        card = QFrame()
        card.setMinimumWidth(450)
        card.setMaximumWidth(480)
        card.setStyleSheet("""
            QFrame {
                background: rgba(15,23,42,0.75);
                border: 1px solid rgba(148,163,184,0.35);
                border-radius: 22px;
            }
        """)
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(25, 25, 25, 25)
        card_layout.setSpacing(20)

        def add_feature(title, desc):
            block = QFrame()
            block.setStyleSheet("""
                QFrame {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(100,116,139,0.25);
                    border-radius: 18px;
                }
            """)
            b_layout = QVBoxLayout(block)
            b_layout.setContentsMargins(18, 15, 18, 15)

            t = QLabel(f"<b style='color:white; font-size:16px;'>{title}</b>")
            d = QLabel(desc)
            d.setStyleSheet("color:#cbd5e1; font-size:13px;")
            d.setWordWrap(True)

            b_layout.addWidget(t)
            b_layout.addWidget(d)

            card_layout.addWidget(block)

        add_feature("1. Upload CSV", "Drag, drop, and validate your process data.")
        add_feature("2. Visualize Instantly", "Interactive charts and KPIs with zero config.")
        add_feature("3. Track Safely", "Secure login, history controls, and reproducible records.")

        hero.addWidget(card, 1)

        container_layout.addLayout(hero)

        # ============================================================
        # SIGNALS
        # ============================================================
        if self.main_window:
            self.btn_login.clicked.connect(self.main_window.show_login)
            self.btn_get_started.clicked.connect(self.main_window.show_login)
            self.btn_create_workspace.clicked.connect(self.main_window.show_login)
            self.btn_view_dashboard.clicked.connect(self.main_window.show_dashboard_page)

    # ============================================================
    # STYLE HELPERS
    # ============================================================
    def _nav_button(self, primary=False):
        if primary:
            return """
                QPushButton {
                    background:#3b82f6;
                    color:white;
                    padding:10px 22px;
                    border-radius:10px;
                    font-size:15px;
                    font-weight:600;
                }
                QPushButton:hover { background:#2563eb; }
            """
        return """
            QPushButton {
                background:#1e293b;
                color:white;
                padding:10px 22px;
                border-radius:10px;
                font-size:15px;
                font-weight:600;
                border:1px solid rgba(255,255,255,0.1);
            }
            QPushButton:hover { background:#334155; }
        """

    def _cta_primary(self):
        return """
            QPushButton {
                background:#3b82f6;
                color:white;
                border-radius:12px;
                font-size:15px;
                font-weight:600;
            }
            QPushButton:hover { background:#2563eb; }
        """

    def _cta_secondary(self):
        return """
            QPushButton {
                background:#1e293b;
                color:white;
                border-radius:12px;
                font-size:15px;
                font-weight:600;
                border:1px solid rgba(255,255,255,0.25);
            }
            QPushButton:hover { background:#334155; }
        """
