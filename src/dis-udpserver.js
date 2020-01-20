const dgram = require('dgram');
const argv = require('yargs').argv;
const dis = require("open-dis");
const DISUtils = require('./DISUtils');

var utils = new DISUtils();

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_MULTICAST = "239.10.229.10";
const DEFAULT_PORT = 9000;

/**
 * Read port as commandline arguments - or take the default if not given:
 */
var port = argv.port || DEFAULT_PORT;
var host = argv.host || DEFAULT_HOST;
var multicast = argv.multicast || DEFAULT_MULTICAST;


var server = dgram.createSocket('udp4');

/**
 * Messagehandler
 * 
 */
server.on('message', (msg, rinfo) => {
  console.log(`server got msg from ${rinfo.address}:${rinfo.port}`);

  try
  {
	var disMessage = utils.DISObjectFromBuffer(msg);
    switch(disMessage.pduType)
    {
        case 1: // EntityState PDU:
            var location = disMessage.entityLocation;
            var marking  = disMessage.marking.getMarking();
            var entityID = disMessage.entityID;
 
            console.log("Got EntityState:", entityID, "Location", location, "Marking: \'" + marking + "\'"             )
           
            break;
        case 20: // Data PDU:
            console.log("Got DataPDU:", entityID);
			break;
		case 25: // Transmitter PDU:
			var transmitter = dis.TransmitterPdu();	
            console.log("Got TransmitterPDU:", transmitter);
			break;
		case 26: // Singal PDU:
			console.log("Got SingalPDU:", entityID);
			break;
		case 27: // Receiver PDU:
			console.log("Got ReceiverPDU:", entityID);
			break;
        default:
            console.log("Got Other PDU:", )
    }
  }catch(e)
  {
      console.log("Exception:", e)
  }
 
});

/**
 * Some debug message to show errors
 */
server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

/**
 * Some debug message to show, when the server started listening
 */
server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

/**
 * Actually start listening on port:
 */
server.bind(port, host, () => {
	server.setBroadcast(true);
	server.setMulticastTTL(5);
	server.addMembership(multicast);
	console.log(`Subscribing to muticast group ${multicast}`);
});