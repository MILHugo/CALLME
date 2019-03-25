var params = [];
var response = "";
var isFirst = null;

navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia

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

function chargeParams() {
    var s = location.search.substring(1, location.search.length).split('&');
    for (var i = 0; i < s.length; i += 1) {
        var param = s[i].split('=');
        params[decodeURIComponent(param[0]).toLowerCase()] = decodeURIComponent(param[1]);
    }
}

function getServerState() {
    firebase.database().ref('/server' + params['id'] + '/offerpeer').once('value').then(
        function(snapshot) {
            console.log(snapshot.val().substring(1,50)+" is "+(snapshot.val() == ""));
            isFirst = snapshot.val() == "";
        }
    );
}

function bindEvents(p) {

  p.on('error', function(err) { 
    console.log('error', err)
  })

  p.on('signal', function(data) {
    if(isFirst) {
        firebase.database().ref('/server' + params['id']).update({'/offerpeer':JSON.stringify(data)});
    }
    else {
        firebase.database().ref('/server' + params['id']).update({'/answerpeer':JSON.stringify(data)});
    }
  })

  p.on('stream', function (stream) {
    let video = document.querySelector('#receiver-video')
    video.volume = 1
	try {
		video.src = window.URL.createObjectURL(stream);
	} catch (error) {
		video.srcObject = stream;
	}
    video.play()
  })

  document.querySelector('#btnReady').addEventListener('click', function (e) {
    e.preventDefault()
    p.signal(JSON.parse(response))
  })
}

function startPeer(initiator) {
   navigator.getUserMedia({ 
      video: true,
      audio: true
   }, function(stream) { 
      let p = new SimplePeer({
         initiator: initiator,
         stream: stream, 
         trickle: false
      })
      bindEvents(p)
      let emitterVideo = document.querySelector('#emitter-video')
      emitterVideo.volume = 0
      try {
        emitterVideo.src = window.URL.createObjectURL(stream);
      } catch (error) {
        emitterVideo.srcObject = stream;
      }
      emitterVideo.play()
    }, function (e) {console.log('There Was An ERROR.\n',e)})
}

function incomingStream(first) {
    if(first) {
        firebase.database().ref('/server' + params['id'] + '/answerpeer').once('value').then(function(snapshot) {
            response = snapshot.val();
        });
    }
    else {
        firebase.database().ref('/server' + params['id'] + '/offerpeer').once('value').then(function(snapshot) {
            response = snapshot.val();
        });
    }
    if(response == "") {
        console.log("waiting for the response ...");
        setTimeout(incomingStream,1000,first);
    }
    else {
        console.log("got the response !");
        document.getElementById('btnReady').style.display = 'block';
    }
}

function launchCall() {
    chargeParams();
    firebase.database().ref('/server' + params['id'] + '/usercount').once('value').then(function(snapshot) {
        console.log('already '+snapshot.val()+' on the server.')
        firebase.database().ref('/server' + params['id']).update({'/usercount':snapshot.val()+1});
    });
    console.log('please wait 3 seconds.');
    setTimeout(start, 3000);
}

function start() {
    getServerState();
    waitForFirst();
}

function waitForFirst() {
    for(var i=0; i<40 && isFirst==null; i++)console.log("waiting ...");
    if(isFirst==null)
        setTimeout(waitForFirst, 300);
    else
        timeToContinue();
}

function timeToContinue() {
    startPeer(isFirst);
    incomingStream(isFirst);
}
