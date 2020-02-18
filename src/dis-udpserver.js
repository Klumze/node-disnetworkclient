const dgram = require('dgram');
const argv = require('yargs').argv;
const dis = require("open-dis");
const DISUtils = require('./DISUtils');
const WaveFile = require('wavefile').WaveFile;

var utils = new DISUtils();

const DEFAULT_MULTICAST = '239.10.229.10';
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 9000;

/**
 * Read host and port as commandline arguments - or take the default if not given:
 */
var multicast = argv.multicast || DEFAULT_MULTICAST;
var port = argv.port || DEFAULT_PORT;
var host = argv.host || DEFAULT_HOST;

var server = dgram.createSocket('udp4');
/**
 * Messagehandler
 */
server.on('message', (msg, rinfo) => {
  console.log(`server got msg from ${rinfo.address}:${rinfo.port}`);

  try
  {
    var disMessage = utils.DISObjectFromBuffer(msg);
    switch(disMessage.pduType)
    {
		case 1: // EntityState PDU:
		    var entityID = disMessage.entityID;
		    var location = disMessage.entityLocation;
		    var marking  = disMessage.marking.getMarking();

		    console.log("Got EntityState:", entityID, "Location", location, "Marking: \'" + marking + "\'");
		   
		    break;
		case 20: // Data PDU:

			console.log("Got DataPDU:");
			
		    break;
		case 25:
			var entityID = disMessage.entityId;
			var radioID = disMessage.radioId;
			var frequency = disMessage.frequency;
			var transmitState = disMessage.transmitState;

			console.log("Got TransmitterPDU:", entityID, "Radio ID", radioID, "Frequency", frequency, "Transmit State", transmitState);

			break;
		case 26:
			var entityID = disMessage.entityId;
			var radioID = disMessage.radioId;
			var data = disMessage.data;
			var samples = disMessage.samples;
			var dataLength = disMessage.dataLength;
			var sampleRate = disMessage.sampleRate;
			var timeStamp = disMessage.timestamp;

			// TODO: Take the data and create a sound file from it
			/*

			How do I string pdu's together to make and audio file?

			var wav = new WaveFile();
			for(var i=0; i < disMessage.samples; i++) {
				disMessage.data[i]
			}
			*/
			console.log("Got SignalPDU:", entityID, "Radio:", radioID, "Sample Rate:", sampleRate, "Num Samples:", samples, "Data length:", dataLength, "Time Stamp:", timeStamp, "Data:", data);
			break;
		case 27:
			var entityID = disMessage.entityId;
			var radioID = disMessage.radioId;
			console.log("Got ReceiverPDU:", entityID, "Radio:", radioID);
			break;
		default:
		    console.log("Got Other PDU:", );
    }
  }catch(e)
  {
      console.log("Exception:", disMessage.pduType);
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
	console.log(`Subscribed to multicast group ${multicast}`);
});
