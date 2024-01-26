import firebase_admin
from firebase_admin import db, credentials

# authenticate to firebase
cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(
    cred, {"databaseURL": "https://testing-project-2a232-default-rtdb.firebaseio.com/"})

# creating reference to root node
ref = db.reference("/")

# retrieving data from root node
data = ref.get()

# retrieving data from mockProfiles node
profiles_data = db.reference("profiles").get()
