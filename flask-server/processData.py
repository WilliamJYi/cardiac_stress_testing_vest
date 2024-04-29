# import numpy as np
# import scipy.signal as signal
# import firebase_admin
# from firebase_admin import credentials, db
# import time
# import csv

# # Initialize Firebase with the specific credentials and database URL
# cred = credentials.Certificate(
#     "mcr2trial-firebase-adminsdk-4lehh-b21f02fb63.json")
# firebase_admin.initialize_app(
#     cred, {"databaseURL": "https://ecgdata-de09c-default-rtdb.firebaseio.com/"})


# def fetch_ecg_data():
#     ref = db.reference('ecg_data')
#     ecg_data = ref.get()
#     if ecg_data is not None:
#         timestamps = np.array(
#             sorted(list(ecg_data.keys()), key=int), dtype=np.int64)
#         values = np.array([ecg_data[str(ts)]
#                           for ts in timestamps], dtype=np.float64)
#         print(timestamps, values)
#         return timestamps, values
#     return None, None


# def pan_tompkins_detector(ecg_signal, fs):
#     """Simplified Pan-Tompkins algorithm implementation for R-peak detection."""
#     # Apply bandpass filter
#     b, a = signal.butter(1, [5 / (0.5 * fs), 15 / (0.5 * fs)], btype='band')
#     filtered_ecg = signal.lfilter(b, a, ecg_signal)

#     # Differentiation, squaring, and moving window integration
#     differentiated_ecg = np.ediff1d(filtered_ecg)
#     squared_ecg = differentiated_ecg ** 2
#     integrated_ecg = np.convolve(squared_ecg, np.ones(
#         int(0.08 * fs))/int(0.08 * fs), mode='same')

#     # Detect peaks
#     peak_indices = signal.find_peaks(integrated_ecg, distance=int(fs * 0.6))[0]
#     return peak_indices


# def calculate_bpm_and_rr_intervals(peak_indices, fs):
#     """Calculate BPM and R-R intervals from detected R-peaks."""
#     rr_intervals = np.diff(peak_indices) / fs
#     bpm = 60 / np.mean(rr_intervals) if len(rr_intervals) > 0 else None
#     return bpm, rr_intervals


# sampling_rate = 100  # Hz


# def get_bpm_data():
#     _, ecg_values = fetch_ecg_data()
#     if ecg_values is not None:
#         r_peaks = pan_tompkins_detector(ecg_values, sampling_rate)
#         if len(r_peaks) > 1:
#             bpm, rr_intervals = calculate_bpm_and_rr_intervals(
#                 r_peaks, sampling_rate)
#             if bpm is not None:
#                 print(f"Current Heart Rate: {bpm:.2f} BPM")
#                 print(f"R-R Intervals (s): {np.round(rr_intervals, 3)}")
#                 return bpm, np.round(rr_intervals, 3)
#         else:
#             print("Insufficient R-peaks detected to calculate BPM.")
#     else:
#         print("No ECG data fetched from Firebase.")
#         return None


# def get_ecg_data():
#     timestamps, values = fetch_ecg_data()
#     # convert to list
#     timestamps = timestamps.tolist()
#     values = values.tolist()
#     return {"ecg_data": {"timestamps": timestamps, "values": values}}

# # # def get_bpm_data():
# # #     while True:
# # #         _, ecg_values = fetch_ecg_data()
# # #         if ecg_values is not None:
# # #             r_peaks = pan_tompkins_detector(ecg_values, sampling_rate)
# # #             if len(r_peaks) > 1:
# # #                 bpm, rr_intervals = calculate_bpm_and_rr_intervals(r_peaks, sampling_rate)
# # #                 bpm_data = bpm
# # #                 if bpm is not None:
# # #                     print(f"Current Heart Rate: {bpm:.2f} BPM")
# # #                     print(f"R-R Intervals (s): {np.round(rr_intervals, 3)}")
# # #                 else:
# # #                     print("Insufficient R-peaks for accurate BPM calculation.")
# # #             else:
# # #                 print("Insufficient R-peaks detected to calculate BPM.")
# # #         else:
# # #             print("No ECG data fetched from Firebase.")

# # #         time.sleep(10)  # Adjust as needed for real-time or desired update frequency

import numpy as np
import scipy.signal as signal
import firebase_admin
from firebase_admin import credentials, db
import time
import csv

# Initialize Firebase with the specific credentials and database URL
cred = credentials.Certificate(
    "ecg1-c2380-firebase-adminsdk-kz746-89256bdc16.json")
firebase_admin.initialize_app(
    cred, {"databaseURL": "https://ecg1-c2380-default-rtdb.firebaseio.com/"})


def fetch_ecg_data():
    ref = db.reference('ecg_data')
    ecg_data = ref.get()
    if ecg_data is not None:
        timestamps = np.array(
            sorted(list(ecg_data.keys()), key=int), dtype=np.int64)
        values = np.array([ecg_data[str(ts)]
                          for ts in timestamps], dtype=np.float64)
        print(timestamps, values)
        return timestamps, values
    return None, None


def pan_tompkins_detector(ecg_signal, fs):
    try:
        # Normalize frequencies by Nyquist frequency (half of sampling rate)
        nyq = 0.5 * fs
        low = 5 / nyq
        high = 15 / nyq

        # Use normalized frequencies directly
        b, a = signal.butter(1, [low, high], btype='band')
        filtered_ecg = signal.lfilter(b, a, ecg_signal)

        differentiated_ecg = np.ediff1d(filtered_ecg)
        squared_ecg = differentiated_ecg ** 2
        integrated_ecg = np.convolve(squared_ecg, np.ones(
            int(0.08 * fs))/int(0.08 * fs), mode='same')

        peak_indices, _ = signal.find_peaks(
            integrated_ecg, distance=int(fs * 0.8))
        return peak_indices
    except Exception as e:
        print(f"Error in pan_tompkins_detector: {e}")
        return np.array([])


def calculate_current_bpm_and_rr_intervals(peak_indices, timestamps, num_peaks=2):
    # Ensure there are enough peaks for calculation
    if len(peak_indices) < 2 or len(peak_indices) < num_peaks + 1:
        return None, np.array([])

    # Focus on the last few R-peaks for current BPM calculation
    recent_peak_indices = peak_indices[-num_peaks:]
    recent_peak_timestamps = timestamps[recent_peak_indices]

    # Calculate RR intervals using the timestamps of the recent R-peaks
    # Convert from milliseconds to seconds
    rr_intervals = np.diff(recent_peak_timestamps) / 1000.0
    print(rr_intervals)
    # Calculate the current BPM based on recent RR intervals
    bpm = 60/np.mean(rr_intervals) if len(rr_intervals) > 0 else None
    print(rr_intervals)
    return bpm, rr_intervals


sampling_rate = 100  # Hz


def save_data_and_results(timestamps, ecg_values, bpm, rr_intervals):
    timestamp_str = time.strftime("%Y%m%d-%H%M%S")
    filename = f"ECG_Data_Results_{timestamp_str}.csv"
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Timestamp', 'ECG Value'])
        for t, value in zip(timestamps, ecg_values):
            writer.writerow([t, value])
        writer.writerow(['BPM', bpm])
        writer.writerow(['R-R Intervals'] + list(np.round(rr_intervals, 3)))


def get_bpm_data():
    timestamps, ecg_values = fetch_ecg_data()
    if ecg_values is not None:
        # Assuming sampling rate is 100 Hz
        r_peaks = pan_tompkins_detector(ecg_values, 100)
        print("RPEAK IS", r_peaks)
        if r_peaks.size > 0:
            # Calculate current BPM using the most recent R-peaks
            bpm, rr_intervals = calculate_current_bpm_and_rr_intervals(
                r_peaks, timestamps, num_peaks=2)  # Adjust num_peaks as needed
            if bpm is not None:
                print(f"Current Heart Rate: {bpm:.2f} BPM")
                print(f"R-R Intervals (s): {np.mean(rr_intervals)}")
                save_data_and_results(
                    timestamps, ecg_values, bpm, rr_intervals)
                return bpm, np.round(rr_intervals, 3)
            else:
                print("Insufficient R-peaks for accurate BPM calculation.")
        else:
            print("No R-peaks detected.")
    else:
        print("No ECG data fetched from Firebase.")
        return None
    time.sleep(5)  # Check for new data every 5 seconds


def get_ecg_data():
    timestamps, values = fetch_ecg_data()
    # convert to list
    timestamps = timestamps.tolist()
    values = values.tolist()
    return {"ecg_data": {"timestamps": timestamps, "values": values}}

# # def get_bpm_data():
# #     while True:
# #         _, ecg_values = fetch_ecg_data()
# #         if ecg_values is not None:
# #             r_peaks = pan_tompkins_detector(ecg_values, sampling_rate)
# #             if len(r_peaks) > 1:
# #                 bpm, rr_intervals = calculate_bpm_and_rr_intervals(r_peaks, sampling_rate)
# #                 bpm_data = bpm
# #                 if bpm is not None:
# #                     print(f"Current Heart Rate: {bpm:.2f} BPM")
# #                     print(f"R-R Intervals (s): {np.round(rr_intervals, 3)}")
# #                 else:
# #                     print("Insufficient R-peaks for accurate BPM calculation.")
# #             else:
# #                 print("Insufficient R-peaks detected to calculate BPM.")
# #         else:
# #             print("No ECG data fetched from Firebase.")

# #         time.sleep(10)  # Adjust as needed for real-time or desired update frequency
