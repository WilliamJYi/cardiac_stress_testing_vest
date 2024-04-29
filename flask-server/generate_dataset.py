import numpy as np
import pandas as pd


def generate_heart_rate_dataset(num_samples=1000):

    # For reproducibility
    np.random.seed(42)

    # Generating random values for each feature
    ages = np.random.randint(18, 81, num_samples)
    heights = np.random.randint(150, 201, num_samples)
    weights = np.random.randint(100, 251, num_samples)
    r_to_r_intervals = np.random.randint(600, 1001, num_samples)
    bpms = np.random.randint(50, 121, num_samples)

    # Determining the target: 0 for bradycardia (<60 BPM), 1 for tachycardia (>100 BPM)
    # Assuming normal BPM (60-100) can be either condition for simplicity
    targets = np.where(bpms < 60, 0, np.where(
        bpms > 100, 1, np.random.choice([0, 1])))

    dataset = pd.DataFrame({
        'Age': ages,
        'Height_cm': heights,
        'Weight_lbs': weights,
        'R_to_R_intervals_ms': r_to_r_intervals,
        'BPM': bpms,
        'Target': targets
    })

    return dataset


heart_rate_dataset = generate_heart_rate_dataset()
