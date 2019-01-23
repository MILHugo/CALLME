var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/create"] = requestHandlers.create;
handle["/save"] = requestHandlers.save;
handle["/load"] = requestHandlers.load;
handle["/moveTo"] = requestHandlers.moveTo;

server.start(router.route, handle);