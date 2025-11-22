# desktop/gui/animated_background.py

from PyQt5.QtWidgets import QWidget
from PyQt5.QtCore import QTimer, Qt
from PyQt5.QtGui import QPainter, QLinearGradient, QRadialGradient, QColor, QBrush
import math
import time


class AnimatedBackground(QWidget):
    """
    Animated, flowy gradient background inspired by the React iridescent shader.
    Uses QPainter (no OpenGL) so normal Qt widgets can sit on top.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self.start_time = time.time()

        # Smooth animation timer (~60 fps)
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update)
        self.timer.start(16)

        # We want to paint behind child widgets
        self.setAttribute(Qt.WA_OpaquePaintEvent, False)
        self.setAutoFillBackground(False)

    def paintEvent(self, event):
        w = max(1, self.width())
        h = max(1, self.height())

        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # Time parameter
        t = time.time() - self.start_time

        # --------------------------
        # 1) Base diagonal gradient
        # --------------------------
        base = QLinearGradient(0, 0, w, h)

        # Colors tuned to match your hero:
        # deep navy, indigo, blue, cyan
        c1 = QColor("#020617")   # very dark blue
        c2 = QColor("#0f172a")   # slate/blue
        c3 = QColor("#1e3a8a")   # indigo
        c4 = QColor("#2563eb")   # bright blue
        c5 = QColor("#38bdf8")   # cyan

        # Animate stops slightly so it looks alive
        osc1 = 0.05 * math.sin(t * 0.3)
        osc2 = 0.05 * math.cos(t * 0.4)
        osc3 = 0.05 * math.sin(t * 0.25 + 1.0)

        base.setColorAt(0.0 + osc1, c1)
        base.setColorAt(0.25 + osc2, c2)
        base.setColorAt(0.55 + osc3, c3)
        base.setColorAt(0.78, c4)
        base.setColorAt(1.0, c5)

        painter.fillRect(self.rect(), base)

        # ---------------------------------------
        # 2) Soft "beam" overlays like your hero
        # ---------------------------------------
        # Wide diagonal light band
        band = QLinearGradient(0, h * 0.3, w, h * 0.7)
        band.setColorAt(0.0, QColor(59, 130, 246, 40))   # blue, low alpha
        band.setColorAt(0.5, QColor(129, 140, 248, 90))  # indigo-ish
        band.setColorAt(1.0, QColor(56, 189, 248, 40))   # cyan, low alpha)
        painter.fillRect(self.rect(), band)

        # Moving spotlight that slowly drifts
        cx = w * (0.3 + 0.15 * math.sin(t * 0.2))
        cy = h * (0.7 + 0.1 * math.cos(t * 0.27))
        radius = max(w, h) * 0.6

        radial = QRadialGradient(cx, cy, radius)
        radial.setColorAt(0.0, QColor(148, 163, 253, 120))  # soft light
        radial.setColorAt(0.5, QColor(59, 130, 246, 40))
        radial.setColorAt(1.0, QColor(15, 23, 42, 0))

        painter.fillRect(self.rect(), radial)

        # ---------------------------------------
        # 3) Subtle top-left glow (hero highlight)
        # ---------------------------------------
        glow = QRadialGradient(w * 0.1, h * 0.1, w * 0.6)
        glow.setColorAt(0.0, QColor(59, 130, 246, 80))
        glow.setColorAt(1.0, QColor(15, 23, 42, 0))
        painter.fillRect(self.rect(), glow)

        painter.end()
