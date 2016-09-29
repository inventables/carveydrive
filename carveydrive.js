var util = require('util');
var SP = require('serialport');

var interval = function(callback) {
  var id = null;

  var start = function(delay) {
    clearInterval(id);
    id = setInterval(callback, delay);
  };

  var stop = function() {
    clearInterval(id);
    id = null;
  };

  var that = {};
  that.start = start;
  that.stop = stop;
  return that;
};

var deviceName = process.argv[2];

if(!deviceName) {
  console.log("Usage: node carveydrive.js <devicename>");
  process.exit();
}


var port = new SP(deviceName, {
  baudrate: 115200,
  parser: SP.parsers.readline('\r\n'),
  errorCallback: function(err) {
    console.log("SP error: " + util.inspect(err));
  }
});

var portOpen = false;

port.on('open', function() {
  console.log("port opened");
  portOpen = true;
});

port.on('data', function(data) {
  console.log("Read data: " + util.inspect(data));
});


var write = function(command) {
  if (portOpen) {
    console.log("Writing: '" + command + "'");
    port.write(command);
  }
};


var heartbeat = interval(function() {
  write('?');
});

var stopHeartbeat = function() {
  heartbeat.stop();
};

var startHeartbeat = function() {
  heartbeat.start(400);
};


var simulateUpload = function() {
  stopHeartbeat();

  // This puts the machine into bootloader mode
  write('$K\n');


  // This takes the machine out of bootloader mode. Why?
  port.close();
  setTimeout(function() {
    console.log("done");
  }, 5000);
};

startHeartbeat();

setTimeout(function() {
  console.log("here we go...");
  simulateUpload();
}, 5000);
