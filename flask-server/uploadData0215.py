import numpy as np
import firebase_admin
from firebase_admin import credentials, db
import time

# Initialize Firebase
cred = credentials.Certificate(
    "mcr2trial-firebase-adminsdk-4lehh-b21f02fb63.json")
firebase_admin.initialize_app(
    cred, {"databaseURL": "https://mcr2trial-default-rtdb.firebaseio.com/"})


def upload_to_firebase(data):
    ref = db.reference()
    ecg_data_ref = ref.child('ecg_data')
    # Overwrites data at the node 'ecg_data'
    ecg_data_ref.set(data)


def generate_ecg_simulator(duration, sampling_rate, heart_rate, noise_amplitude, periodic_noise_freq=50, periodic_noise_amplitude=0.05):
    t = np.arange(0, duration, 1/sampling_rate)
    # Adjusted for BPM
    normal_heartbeat = np.sin(2 * np.pi * heart_rate * t / 60)
    print(normal_heartbeat)
   # if (ecg_signal < (heart_rate-10) and ecg_signal > (heart_rate+10)):
    # ecg_signal = np.clip(ecg_signal, heart_rate-10, heart_rate+10)

    qrs_complex = np.zeros_like(t)
    qrs_start = int(0.1 * sampling_rate)
    qrs_end = int(0.2 * sampling_rate)
    # Simulate QRS complex
    qrs_complex[qrs_start:qrs_end] = np.sin(
        2 * np.pi * 5 * t[qrs_start:qrs_end])

    p_wave = np.zeros_like(t)
    p_wave_end = int(0.1 * sampling_rate)
    # Simulate P wave
    p_wave[:p_wave_end] = np.sin(2 * np.pi * 3 * t[:p_wave_end])

    t_wave = np.zeros_like(t)
    t_wave_start = int(0.2 * sampling_rate)
    # Simulate T wave
    t_wave[t_wave_start:] = np.sin(2 * np.pi * 2 * t[t_wave_start:])

    # Combine components
    ecg_signal = normal_heartbeat + 0.2 * qrs_complex + 0.1 * p_wave + 0.1 * t_wave

    # Add random noise
    noise = noise_amplitude * np.random.randn(len(t))
    ecg_signal += noise

    # Add periodic noise
    periodic_noise = periodic_noise_amplitude * \
        np.sin(2 * np.pi * periodic_noise_freq * t)
    ecg_signal += periodic_noise

    # ensure the ecg_voltage is in threshold

    return t, ecg_signal


def simulate_condition(heart_rate, condition_label, duration=2, sampling_rate=100, noise_amplitude=0.1):
    while True:
        t, ecg_signal = generate_ecg_simulator(
            duration, sampling_rate, heart_rate, noise_amplitude)
        data_dict = {f"{timestamp:.4f}".replace(
            ".", "_"): value for timestamp, value in zip(t, ecg_signal)}
        upload_to_firebase(data_dict)
        print(f"Uploaded {condition_label} ECG data")
        time.sleep(duration)


# Choose the condition you want to simulate by uncommenting one of the following lines:

# Young person: typically has a resting heart rate of 60-100 BPM. Choosing 60 for a fit, young individual.
# simulate_condition(60, "young")

# Old person: Older adults may have a slightly higher resting heart rate. Choosing 70 BPM.
# simulate_condition(70, "old")

# Person with arrhythmia: This condition involves irregular heartbeats. For simplicity, the heart rate is randomly chosen between 50 and 120 BPM to simulate variability.
# simulate_condition(np.random.randint(50, 120), "arrhythmia")

# Person with tachycardia: Characterized by a fast heart rate, typically over 100 BPM at rest. Choosing 120 BPM for this simulation.
simulate_condition(120, "tachycardia")
