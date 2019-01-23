var admin = require("firebase-admin");

var serviceAccount = require("keys/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://callme-86703.firebaseio.com"
});