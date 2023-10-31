from flask import Flask
import test

app = Flask(__name__)

# Members API Route


@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]}


@app.route("/firebase")
def firebase():
    return test.data


print(test.data)

if __name__ == "__main__":
    app.run(debug=True)
