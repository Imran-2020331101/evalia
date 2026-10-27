import io
import json
import math
import sys
from unittest import mock

import pytest

from tests.conftest import FakeFaceMesh, Pt, load_worker, make_face


def frame_line(interview_id="int-1", payload=b"hello"):
    import base64
    b64 = base64.b64encode(payload).decode()
    return json.dumps({"interviewId": interview_id, "frame": f"data:image/jpeg;base64,{b64}"}) + "\n"


# --------------------------------------------------------------------------- module setup
class TestModuleSetup:
    def test_face_mesh_is_configured_for_video_with_five_faces(self, worker):
        assert len(FakeFaceMesh.instances) == 1
        assert FakeFaceMesh.instances[0].kwargs == {
            "static_image_mode": False,
            "max_num_faces": 5,
            "refine_landmarks": True,
            "min_detection_confidence": 0.5,
            "min_tracking_confidence": 0.5,
        }

    def test_initial_state(self, worker):
        assert worker.blink_counter == 0
        assert worker.last_blink_time == 0
        assert worker.blink_threshold == 0.22
        assert worker.blink_per_min == 0
        assert worker.frame_count == 0
        assert worker.start_time > 0

    def test_empty_stdin_produces_no_output(self, run_loop):
        _, out, err = run_loop("")
        assert out == "" and err == ""


class TestEuclideanDistance:
    def test_distance(self, worker):
        assert worker.euclidean_distance(Pt(0, 0), Pt(3, 4)) == 5.0

    def test_zero_and_symmetry(self, worker):
        a, b = Pt(0.1, 0.2), Pt(0.4, 0.6)
        assert worker.euclidean_distance(a, a) == 0
        assert worker.euclidean_distance(a, b) == pytest.approx(worker.euclidean_distance(b, a))
        assert worker.euclidean_distance(a, b) == pytest.approx(math.hypot(0.3, 0.4))


# --------------------------------------------------------------------------- process_frame
def set_faces(worker, faces):
    FakeFaceMesh.instances[-1].result.multi_face_landmarks = faces


class TestProcessFrame:
    def test_no_face(self, worker):
        set_faces(worker, None)
        m = worker.process_frame("IMG")
        assert m == {"faceCount": 0, "eyeContact": 0.0, "speaking": 0.0, "blinkRate": 0}
        worker._cv2.cvtColor.assert_called_with("IMG", worker._cv2.COLOR_BGR2RGB)

    def test_converts_bgr_to_rgb_before_processing(self, worker):
        set_faces(worker, None)
        worker.process_frame("IMG")
        assert FakeFaceMesh.instances[-1].last_input == ("rgb", "IMG")

    def test_empty_landmark_list_is_treated_as_no_face(self, worker):
        set_faces(worker, [])
        assert worker.process_frame("IMG")["faceCount"] == 0

    def test_face_count_matches_detected_faces(self, worker):
        set_faces(worker, [make_face(), make_face(), make_face()])
        assert worker.process_frame("IMG")["faceCount"] == 3

    def test_perfect_eye_contact(self, worker):
        set_faces(worker, [make_face(iris_x=0.5, nose_x=0.5)])
        assert worker.process_frame("IMG")["eyeContact"] == 1.0

    def test_eye_contact_decreases_with_offset(self, worker):
        set_faces(worker, [make_face(iris_x=0.6, nose_x=0.5)])  # 1 - 0.1*5 = 0.5
        assert worker.process_frame("IMG")["eyeContact"] == 0.5

    def test_eye_contact_is_clamped_to_zero(self, worker):
        set_faces(worker, [make_face(iris_x=0.9, nose_x=0.1)])
        assert worker.process_frame("IMG")["eyeContact"] == 0.0

    def test_eye_contact_uses_the_last_face(self, worker):
        set_faces(worker, [make_face(iris_x=0.9, nose_x=0.1), make_face(iris_x=0.5, nose_x=0.5)])
        assert worker.process_frame("IMG")["eyeContact"] == 1.0

    def test_speaking_scales_with_mouth_opening(self, worker):
        set_faces(worker, [make_face(mouth_open=0.02)])  # 0.3
        assert worker.process_frame("IMG")["speaking"] == 0.3

    def test_speaking_is_capped_at_one(self, worker):
        set_faces(worker, [make_face(mouth_open=0.5)])
        assert worker.process_frame("IMG")["speaking"] == 1.0

    def test_closed_mouth_is_not_speaking(self, worker):
        set_faces(worker, [make_face(mouth_open=0.0)])
        assert worker.process_frame("IMG")["speaking"] == 0.0

    def test_values_are_rounded_to_two_decimals(self, worker):
        set_faces(worker, [make_face(iris_x=0.5123456, nose_x=0.5, mouth_open=0.0123456)])
        m = worker.process_frame("IMG")
        assert m["eyeContact"] == round(m["eyeContact"], 2)
        assert m["speaking"] == round(m["speaking"], 2)


class TestBlinkDetection:
    def test_open_eye_does_not_count_a_blink(self, worker):
        set_faces(worker, [make_face(eye_open=0.3)])
        with mock.patch.object(worker.time, "time", return_value=worker.start_time + 60):
            m = worker.process_frame("IMG")
        assert worker.blink_counter == 0
        assert m["blinkRate"] == 0.0

    def test_closed_eye_counts_a_blink_and_updates_rate(self, worker):
        set_faces(worker, [make_face(eye_open=0.1)])
        with mock.patch.object(worker.time, "time", return_value=worker.start_time + 60):
            m = worker.process_frame("IMG")
        assert worker.blink_counter == 1
        assert worker.last_blink_time == worker.start_time + 60
        assert m["blinkRate"] == 1.0  # 1 blink in 1 minute

    def test_blinks_within_200ms_are_debounced(self, worker):
        set_faces(worker, [make_face(eye_open=0.1)])
        now = worker.start_time + 30
        worker.last_blink_time = now - 0.1
        with mock.patch.object(worker.time, "time", return_value=now):
            worker.process_frame("IMG")
        assert worker.blink_counter == 0

    def test_second_blink_after_debounce_window_is_counted(self, worker):
        set_faces(worker, [make_face(eye_open=0.1)])
        t = worker.start_time + 30
        with mock.patch.object(worker.time, "time", return_value=t):
            worker.process_frame("IMG")
        with mock.patch.object(worker.time, "time", return_value=t + 0.5):
            m = worker.process_frame("IMG")
        assert worker.blink_counter == 2
        assert m["blinkRate"] == round(2 / ((t + 0.5 - worker.start_time) / 60), 2)

    def test_threshold_is_exclusive(self, worker):
        set_faces(worker, [make_face(eye_open=0.22)])
        with mock.patch.object(worker.time, "time", return_value=worker.start_time + 10):
            worker.process_frame("IMG")
        assert worker.blink_counter == 0

    def test_no_elapsed_time_leaves_rate_unchanged(self, worker):
        set_faces(worker, [make_face(eye_open=0.1)])
        with mock.patch.object(worker.time, "time", return_value=worker.start_time):
            m = worker.process_frame("IMG")
        assert worker.blink_counter == 1
        assert m["blinkRate"] == 0

    def test_blink_rate_is_carried_over_when_no_face_is_visible(self, worker):
        set_faces(worker, [make_face(eye_open=0.1)])
        with mock.patch.object(worker.time, "time", return_value=worker.start_time + 60):
            worker.process_frame("IMG")
        set_faces(worker, None)
        assert worker.process_frame("IMG")["blinkRate"] == 1.0

    def test_zero_eye_width_raises_division_error(self, worker):
        # Documents current behaviour: degenerate landmarks (eye corners coincide) are not guarded;
        # the stdin loop's try/except is what keeps the worker alive.
        face = make_face()
        face.landmark[133] = Pt(0.0, 0.0)
        set_faces(worker, [face])
        with pytest.raises(ZeroDivisionError):
            worker.process_frame("IMG")


# --------------------------------------------------------------------------- stdin loop
class TestStdinLoop:
    def test_decodes_frame_and_writes_one_json_line(self, run_loop):
        mod, out, err = run_loop(frame_line("abc", b"jpegbytes"))
        assert err == ""
        lines = out.splitlines()
        assert len(lines) == 1
        payload = json.loads(lines[0])
        assert payload == {
            "interviewId": "abc",
            "metrics": {"faceCount": 0, "eyeContact": 0.0, "speaking": 0.0, "blinkRate": 0},
        }
        # the data-URI header was stripped and raw bytes reached cv2.imdecode
        buf, flag = mod._cv2.imdecode.call_args[0]
        assert bytes(buf) == b"jpegbytes"
        assert flag == mod._cv2.IMREAD_COLOR

    def test_reports_detected_faces(self, run_loop):
        _, out, _ = run_loop(frame_line(), faces=[make_face(), make_face()])
        assert json.loads(out)["metrics"]["faceCount"] == 2

    def test_processes_each_line_in_order(self, run_loop):
        _, out, err = run_loop(frame_line("a") + frame_line("b") + frame_line("c"))
        assert [json.loads(l)["interviewId"] for l in out.splitlines()] == ["a", "b", "c"]
        assert err == ""

    def test_invalid_json_is_logged_to_stderr_and_loop_continues(self, run_loop):
        _, out, err = run_loop("not json\n" + frame_line("ok"))
        assert err.strip() != ""
        assert [json.loads(l)["interviewId"] for l in out.splitlines()] == ["ok"]

    def test_missing_keys_are_logged_and_skipped(self, run_loop):
        _, out, err = run_loop(json.dumps({"interviewId": "x"}) + "\n" + frame_line("ok"))
        assert "frame" in err
        assert len(out.splitlines()) == 1

    def test_frame_without_data_uri_header_is_rejected(self, run_loop):
        bad = json.dumps({"interviewId": "x", "frame": "AAAA"}) + "\n"
        _, out, err = run_loop(bad)
        assert out == ""
        assert "index" in err.lower()

    def test_invalid_base64_is_rejected(self, run_loop):
        bad = json.dumps({"interviewId": "x", "frame": "data:image/jpeg;base64,A"}) + "\n"
        _, out, err = run_loop(bad)
        assert out == ""
        assert err.strip() != ""

    def test_blank_line_is_an_error_not_a_crash(self, run_loop):
        _, out, err = run_loop("\n" + frame_line("ok"))
        assert err.strip() != ""
        assert len(out.splitlines()) == 1

    def test_processing_errors_inside_process_frame_are_contained(self, run_loop):
        degenerate = make_face()
        from tests.conftest import Pt as P
        degenerate.landmark[133] = P(0.0, 0.0)
        _, out, err = run_loop(frame_line("a"), faces=[degenerate])
        assert out == ""
        assert "division" in err.lower()

    def test_non_ascii_interview_id_roundtrips(self, run_loop):
        _, out, _ = run_loop(frame_line("ইন্টারভিউ-১"))
        assert json.loads(out)["interviewId"] == "ইন্টারভিউ-১"

    def test_stdout_is_flushed_per_frame(self):
        flushed = []

        class Out(io.StringIO):
            def flush(self):
                flushed.append(self.getvalue())
                super().flush()

        out = Out()
        from tests import conftest
        conftest._install_fakes()
        import importlib.util
        spec = importlib.util.spec_from_file_location("worker_flush", conftest.WORKER_PATH)
        module = importlib.util.module_from_spec(spec)
        with mock.patch.object(sys, "stdin", io.StringIO(frame_line("a") + frame_line("b"))), \
             mock.patch.object(sys, "stdout", out), mock.patch.object(sys, "stderr", io.StringIO()):
            spec.loader.exec_module(module)
        assert len(flushed) == 2
        assert flushed[0].count("\n") == 1 and flushed[1].count("\n") == 2
        sys.modules.pop("worker_flush", None)
