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

function getServers() {
    firebase.database().ref().once('value').then(function(snapshot) {
        chargeData(snapshot.val());
    });
}

function chargeData(data) {
    var i;
    for(i=1; i<100; i++) {
        var server = data['server'+(i<10?'0'+i:i)];
        if(server)
            if(server.usercount<2)
                document.getElementById('serverList').innerHTML += '\n<li>'+
                                                                    '\n<a href="call.html?id='+(i<10?'0'+i:i)+'">'+
                                                                    '\nServeur '+(i<10?'0'+i:i)+' : '+server['name']+' ['+server['usercount']+'/2]'+
                                                                    '\n</a>'+
                                                                    '\n</li>\n';
            else
                document.getElementById('serverList').innerHTML += '\n<li>'+
                                                                    '\nServeur '+(i<10?'0'+i:i)+' : '+server['name']+' ['+server['usercount']+'/2]'+
                                                                    '\n</li>\n';
    }
}

getServers();