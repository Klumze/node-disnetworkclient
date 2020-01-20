const dgram = require('dgram');
const dis = require("open-dis");
const argv = require('yargs').argv;
const DISUtils = require('./DISUtils');

var utils = new DISUtils();

var DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 9000

/**
 * Read host & port as commandline arguments - or take the default if not given:
 */
var host = argv.host || DEFAULT_HOST
var port = argv.port || DEFAULT_PORT


var client = dgram.createSocket('udp4');        /** Open a UDP-Client */

/**
 * Create a Dummy EntityState-PDU and fill it with dummy data - just for testing:
 */
var disEntityStatePDU= new dis.EntityStatePdu()
disEntityStatePDU.entityID.site = 11;
disEntityStatePDU.entityID.application = 22;
disEntityStatePDU.entityID.entity = 33;
disEntityStatePDU.marking.setMarking("Example Entity")


var ePUDentityID = disEntityStatePDU.entityID;
var ePUDlocation = disEntityStatePDU.entityLocation;
var ePUDmarking  = disEntityStatePDU.marking.getMarking();
console.log("Sending EntityState:", ePUDentityID, "Location", ePUDlocation, "Marking: \'" + ePUDmarking + "\'" );

var disTransmitterPDU = new dis.TransmitterPdu();
disTransmitterPDU.entityId.site = 12;
disTransmitterPDU.entityId.application = 23;
disTransmitterPDU.entityId.entity = 33;
disTransmitterPDU.frequency = '1000000';



/**
 * Encode the PDU intoto networkbuffer:
 */
message = utils.DISPduToBuffer(disEntityStatePDU);
message2 = utils.DISPduToBuffer(disTransmitterPDU);

/**
 * Send the message on network and finish
 */
client.send(message, 0, message.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ port);
});

client.send(message2, 0, message.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ port);
    client.close();
});