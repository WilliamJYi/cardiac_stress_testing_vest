from flask import Flask, request
import processData
import binary_classification
# import test

app = Flask(__name__)

# Members API Route


@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]}


@app.route("/bpm_data")
def bpm_data():
    bpm, rr_intervals = processData.get_bpm_data()
    # Converts the rr_intervals to list for JSON serialization
    rr_intervals = rr_intervals.tolist()
    return {"bpm_data": bpm, "rr_intervals": rr_intervals}


@app.route("/ecg_data")
def ecg_data():
    return processData.get_ecg_data()


@app.route("/heart_condition")
def heart_condition():
    age = int(request.args.get('age'))
    height = int(request.args.get('height'))
    weight = int(request.args.get('weight'))
    rr = float(request.args.get('rr'))
    bpm = float(request.args.get('bpm'))

    patient_data = [[age, height, weight, rr, bpm]]

    heart_condition = "Tachycardia" if binary_classification.predict_heart_condition(
        patient_data) else "Bradycardia"

    return {"heart_condition": heart_condition}


if __name__ == "__main__":
    app.run(debug=True)
