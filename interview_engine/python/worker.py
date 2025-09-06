import sys
import json
import base64
import cv2
import numpy as np
import mediapipe as mp
import math
import time

# Mediapipe setups
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

blink_counter = 0
last_blink_time = 0
blink_threshold = 0.22  # EAR threshold
blink_per_min = 0
frame_count = 0
start_time = time.time()

def euclidean_distance(p1, p2):
    return math.dist((p1.x, p1.y), (p2.x, p2.y))

def process_frame(image):
    global blink_counter, last_blink_time, blink_per_min, frame_count

    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = mp_face_mesh.process(img_rgb)

    face_count = 0
    eye_contact = 0.0
    speaking = 0.0
    blink_rate = blink_per_min

    if results.multi_face_landmarks:
        face_count = len(results.multi_face_landmarks)

        for face_landmarks in results.multi_face_landmarks:
            # Eye contact check (looking straight)
            left_eye_center = face_landmarks.landmark[468]  # iris center
            right_eye_center = face_landmarks.landmark[473]
            nose_tip = face_landmarks.landmark[1]

            # Simple heuristic: if iris centers are roughly aligned with nose in X-axis
            eye_contact = 1.0 - abs((left_eye_center.x + right_eye_center.x)/2 - nose_tip.x) * 5
            eye_contact = max(0.0, min(1.0, eye_contact))

            # Blink detection (Eye Aspect Ratio for left eye)
            left_eye_top = face_landmarks.landmark[159]
            left_eye_bottom = face_landmarks.landmark[145]
            left_eye_left = face_landmarks.landmark[33]
            left_eye_right = face_landmarks.landmark[133]

            vertical_dist = euclidean_distance(left_eye_top, left_eye_bottom)
            horizontal_dist = euclidean_distance(left_eye_left, left_eye_right)
            ear = vertical_dist / horizontal_dist

            if ear < blink_threshold:
                if time.time() - last_blink_time > 0.2:
                    blink_counter += 1
                    last_blink_time = time.time()

            elapsed_min = (time.time() - start_time) / 60
            if elapsed_min > 0:
                blink_per_min = blink_counter / elapsed_min
            blink_rate = round(blink_per_min, 2)

            # Speaking detection (mouth openness)
            upper_lip = face_landmarks.landmark[13]
            lower_lip = face_landmarks.landmark[14]
            mouth_open_ratio = euclidean_distance(upper_lip, lower_lip)
            speaking = min(1.0, mouth_open_ratio * 15)  # normalize

    return {
        "faceCount": face_count,
        "eyeContact": round(eye_contact, 2),
        "speaking": round(speaking, 2),
        "blinkRate": blink_rate
    }

# Frame reading loop
for line in sys.stdin:
    try:
        data = json.loads(line)
        interview_id = data["interviewId"]
        frame_data = data["frame"].split(",")[1]  # remove base64 header
        frame_bytes = base64.b64decode(frame_data)
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        metrics = process_frame(img)

        output = {
            "interviewId": interview_id,
            "metrics": metrics
        }
        sys.stdout.write(json.dumps(output) + "\n")
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(str(e) + "\n")
