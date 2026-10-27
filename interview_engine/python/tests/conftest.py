"""
Test harness for worker.py.

worker.py builds a MediaPipe FaceMesh at import time and then immediately starts
consuming `sys.stdin` in a module-level loop. To test it offline we:
  * install fake `cv2` / `mediapipe` modules in sys.modules (numpy is real if installed),
  * import the module with an empty stdin so the loop is a no-op,
  * expose helpers to build fake face landmarks and to run the stdin loop on demand.
"""
import importlib.util
import io
import os
import sys
import types
from unittest import mock

import pytest

WORKER_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "worker.py")


class Pt:
    def __init__(self, x=0.0, y=0.0):
        self.x, self.y = x, y


class Face:
    """Fake MediaPipe face with a 478-entry landmark list."""

    def __init__(self, points=None):
        self.landmark = [Pt() for _ in range(478)]
        for idx, (x, y) in (points or {}).items():
            self.landmark[idx] = Pt(x, y)


def make_face(*, iris_x=0.5, nose_x=0.5, eye_open=0.3, mouth_open=0.0):
    """
    eye_open: vertical eye distance (horizontal is fixed at 1.0 => EAR == eye_open).
    mouth_open: distance between lips (13/14).
    """
    return Face({
        468: (iris_x, 0.0), 473: (iris_x, 0.0), 1: (nose_x, 0.0),
        159: (0.0, 0.0), 145: (0.0, eye_open), 33: (0.0, 0.0), 133: (1.0, 0.0),
        13: (0.0, 0.0), 14: (0.0, mouth_open),
    })


class FakeFaceMesh:
    instances = []
    default_faces = None  # faces returned by process(); set before importing worker for loop tests

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.result = types.SimpleNamespace(multi_face_landmarks=FakeFaceMesh.default_faces)
        FakeFaceMesh.instances.append(self)

    def process(self, img):
        self.last_input = img
        return self.result


def _install_fakes():
    cv2 = types.ModuleType("cv2")
    cv2.COLOR_BGR2RGB = 4
    cv2.IMREAD_COLOR = 1
    cv2.cvtColor = mock.MagicMock(side_effect=lambda img, code: ("rgb", img))
    cv2.imdecode = mock.MagicMock(return_value="IMG")

    mp = types.ModuleType("mediapipe")
    mp.solutions = types.SimpleNamespace(face_mesh=types.SimpleNamespace(FaceMesh=FakeFaceMesh))

    sys.modules["cv2"] = cv2
    sys.modules["mediapipe"] = mp
    if "numpy" not in sys.modules:
        try:
            import numpy  # noqa: F401
        except ImportError:  # pragma: no cover
            np = types.ModuleType("numpy")
            np.uint8 = "uint8"
            np.frombuffer = lambda b, dtype=None: ("arr", bytes(b))
            sys.modules["numpy"] = np
    return cv2, mp


def load_worker(stdin_text="", name="worker_under_test", faces=None):
    """Import a fresh copy of worker.py with the given stdin contents."""
    cv2, _ = _install_fakes()
    FakeFaceMesh.instances.clear()
    FakeFaceMesh.default_faces = faces
    sys.modules.pop(name, None)
    spec = importlib.util.spec_from_file_location(name, WORKER_PATH)
    module = importlib.util.module_from_spec(spec)
    out, err = io.StringIO(), io.StringIO()
    with mock.patch.object(sys, "stdin", io.StringIO(stdin_text)), \
         mock.patch.object(sys, "stdout", out), mock.patch.object(sys, "stderr", err):
        spec.loader.exec_module(module)
    module._out, module._err, module._cv2 = out, err, cv2
    return module


@pytest.fixture
def worker():
    """worker.py imported with an empty stdin (loop does nothing)."""
    mod = load_worker("")
    yield mod
    sys.modules.pop("worker_under_test", None)


@pytest.fixture
def run_loop():
    """Import worker.py with given stdin text; returns (module, stdout_text, stderr_text)."""
    def _run(stdin_text, faces=None):
        mod = load_worker(stdin_text, faces=faces)
        return mod, mod._out.getvalue(), mod._err.getvalue()
    return _run
