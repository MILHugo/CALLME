// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
    apiKey: "AIzaSyA5IjK57LyT9IAiZoVvmI8SN8FpXTDp59Q",
    authDomain: "callme-86703.firebaseapp.com",
    databaseURL: "https://callme-86703.firebaseio.com",
    storageBucket: "callme-86703.appspot.com"
  };

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

function createServer() {
    firebase.database().ref().once('value').then(function(snapshot) {
        var i=1;
        if(snapshot.val()!=null)
            for(i=1; snapshot.val()['server'+(i<10?'0'+i:i)]; i++);
        if(i<100) {
            var name = document.getElementById('callName').value;
            var password = document.getElementById('callPassword').value;
            firebase.database().ref('/server'+(i<10?'0'+i:i)).set({
                name:name,
                password:password,
                answerpeer:'',
                offerpeer:'',
                usercount:0
            });
        }
        else
            alert("We're sorry, the maximum number of call servers is already reach.")
    });
}