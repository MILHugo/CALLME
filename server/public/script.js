var config = {
  apiKey: "AIzaSyA5IjK57LyT9IAiZoVvmI8SN8FpXTDp59Q",
  authDomain: "callme-86703.firebaseapp.com",
  databaseURL: "https://callme-86703.firebaseio.com",
  storageBucket: "callme-86703.appspot.com"
};
firebase.initializeApp(config);
var database = firebase.database();
var startRecordingButton = document.getElementById("startRecordingButton");
var stopRecordingButton = document.getElementById("stopRecordingButton");
var playButton = document.getElementById("playButton");
var downloadButton = document.getElementById("downloadButton");
var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;


function onLoad() {
  var starCountRef = firebase.database().ref('discussion/textuel');
  starCountRef.on('value', function (snapshot) {
    document.getElementById('conversation').innerHTML = snapshot.val();
  });
}


function sendText() {
  firebase.database().ref('discussion').set({
    textuel: document.getElementById('conversation').innerHTML + document.getElementById('textMsg')
      .value + '\n'
  });
  document.getElementById('textMsg').value = "";
  onLoad();
}



startRecordingButton.addEventListener("click", function () {
  // Initialize recorder
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  navigator.getUserMedia({
      audio: true
    },
    function (e) {
      console.log("user consent");
      // creates the audio context
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      // creates an audio node from the microphone incoming stream
      mediaStream = context.createMediaStreamSource(e);
      // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
      // bufferSize: the onaudioprocess event is called when the buffer is full
      var bufferSize = 2048;
      var numberOfInputChannels = 2;
      var numberOfOutputChannels = 2;
      if (context.createScriptProcessor) {
        recorder = context.createScriptProcessor(bufferSize,
          numberOfInputChannels,
          numberOfOutputChannels);
      } else {
        recorder = context.createJavaScriptNode(bufferSize,
          numberOfInputChannels,
          numberOfOutputChannels);
      }
      leftchannel = [];
      rightchannel = [];
      recorder.onaudioprocess = function (e) {
        // await new Promise(resolve => setTimeout(resolve, 1000));

        leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(
          0)));
        rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(
          1)));
        recordingLength += bufferSize;
        firebase.database().ref('discussion/audio').set({
          leftchannel: leftchannel,
          rightchannel: rightchannel
        });
      }
      // we connect the recorder
      mediaStream.connect(recorder);
      recorder.connect(context.destination);
    },
    function (e) {
      console.error(e);
    });
});
stopRecordingButton.addEventListener("click", function () {
  // stop recording
  recorder.disconnect(context.destination);
  mediaStream.disconnect(recorder);
  // we flat the left and right channels down
  // Float32Array[] => Float32Array
  var leftBuffer = flattenArray(leftchannel, recordingLength);
  var rightBuffer = flattenArray(rightchannel, recordingLength);
  // we interleave both channels together
  // [left[0],right[0],left[1],right[1],...]
  var interleaved = interleave(leftBuffer, rightBuffer);
  // we create our wav file
  var buffer = new ArrayBuffer(44 + interleaved.length * 2);
  var view = new DataView(buffer);
  // RIFF chunk descriptor
  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 44 + interleaved.length * 2, true);
  writeUTFBytes(view, 8, 'WAVE');
  // FMT sub-chunk
  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunkSize
  view.setUint16(20, 1, true); // wFormatTag
  view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
  view.setUint32(24, sampleRate, true); // dwSamplesPerSec
  view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
  view.setUint16(32, 4, true); // wBlockAlign
  view.setUint16(34, 16, true); // wBitsPerSample
  // data sub-chunk
  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, interleaved.length * 2, true);
  // write the PCM samples
  var index = 44;
  var volume = 1;
  for (var i = 0; i < interleaved.length; i++) {
    view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
    index += 2;
  }
  // our final blob
  blob = new Blob([view], {
    type: 'audio/wav'
  });
});
playButton.addEventListener("click", function () {
  if (blob == null) {
    return;
  }
  var url = window.URL.createObjectURL(blob);
  var audio = new Audio(url);
  audio.play();
});
downloadButton.addEventListener("click", function () {
  if (blob == null) {
    return;
  }
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "sample.wav";
  a.click();
  window.URL.revokeObjectURL(url);
});

function flattenArray(channelBuffer, recordingLength) {
  var result = new Float32Array(recordingLength);
  var offset = 0;
  for (var i = 0; i < channelBuffer.length; i++) {
    var buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function interleave(leftChannel, rightChannel) {
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);
  var inputIndex = 0;
  for (var index = 0; index < length;) {
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeUTFBytes(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}