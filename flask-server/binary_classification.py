import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, recall_score
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import generate_dataset

# Step 1: Generate the dataset
dataset = generate_dataset.generate_heart_rate_dataset()
features = dataset.columns[:-1]

X = dataset[features]
y = dataset['Target']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=0)

# Standardize the data
ss_train = StandardScaler()
X_train = ss_train.fit_transform(X_train)

ss_test = StandardScaler()
X_test = ss_test.fit_transform(X_test)

# Step 2: Instantiate the model
model = LogisticRegression()

# Step 3: Train the model
model.fit(X_train, y_train)

# Step 4: Classification Scheme

# Calculate predictions
predictions = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, predictions)

# Calculate sensitivity (recall)
sensitivity = recall_score(y_test, predictions)

# Calculate specificity
conf_matrix = confusion_matrix(y_test, predictions)
TN, FP, FN, TP = conf_matrix.ravel()
specificity = TN / (TN + FP)

# Calculate F1-score
f1 = f1_score(y_test, predictions)

# Print the metrics
print("----------------------")
print("Classification Scheme:")
print("----------------------")
print(f"Accuracy: {accuracy_score(y_test, predictions):.2f}")
print(f"Sensitivity (Recall): {sensitivity:.2f}")
print(f"Specificity: {specificity:.2f}")
print(f"F1-Score: {f1:.2f}")


def predict_heart_condition(data):
    data_scaled = ss_test.transform(data)
    prediction = model.predict(data_scaled)
    return prediction[0]


# Test model with mock data
mock_data = [[30, 170, 160, 700, 65]]
result = predict_heart_condition(mock_data)
print("----------------------")
print("New Data Point:")
print("----------------------")
print(f"Prediction: {result}")
