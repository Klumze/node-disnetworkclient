const dgram = require('dgram');
const dis = require("open-dis");
const argv = require('yargs').argv;
const DISUtils = require('./DISUtils');

var utils = new DISUtils();

var DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 9000;

/**
 * Read host & port as commandline arguments - or take the default if not given:
 */
var host = argv.host || DEFAULT_HOST
var port = argv.port || DEFAULT_PORT


var client = dgram.createSocket('udp4');        /** Open a UDP-Client */

/**
 * Create a Dummy EntityState-PDU and fill it with dummy data - just for testing:
 */
var disEntityStatePDU= new dis.EntityStatePdu();
disEntityStatePDU.entityID.site = 11;
disEntityStatePDU.entityID.application = 22;
disEntityStatePDU.entityID.entity = 33;
disEntityStatePDU.marking.setMarking("Example Entity");

var disTransmitterPDU= new dis.TransmitterPdu();
disTransmitterPDU.entityId.site = 12;
disTransmitterPDU.entityId.application = 23;
disTransmitterPDU.entityId.entity = 34;
disTransmitterPDU.radioId = 10;
disTransmitterPDU.frequency = '100000';

var disSignalPDU = new dis.SignalPdu();
disSignalPDU.entityId.site = 13;
disSignalPDU.entityId.application = 24;
disSignalPDU.entityId.entity = 34;
disSignalPDU.radioId = 11;

var disReceiverPDU = new dis.ReceiverPdu();
disReceiverPDU.entityId.site = 14;
disReceiverPDU.entityId.application = 25;
disReceiverPDU.entityId.entity = 35;
disReceiverPDU.radioId = 12;


var ePDUentityID = disEntityStatePDU.entityID;
var ePDUlocation = disEntityStatePDU.entityLocation;
var ePDUmarking  = disEntityStatePDU.marking.getMarking();
console.log("Sending EntityState:", ePDUentityID, "Location", ePDUlocation, "Marking: \'" + ePDUmarking + "\'" );

var tPDUentityID = disTransmitterPDU.entityId;
var tPDUradioID = disTransmitterPDU.radioId;
var tPDUfrequency = disTransmitterPDU.frequency;
console.log("Sending Transmitter:", tPDUentityID, "Radio", tPDUradioID, "Frequency", tPDUfrequency);

var sPDUentityID = disSignalPDU.entityId;
var sPDUradioID = disSignalPDU.radioId;
console.log("Sending Transmitter:", sPDUentityID, "Radio", sPDUradioID);

var rPDUentityID = disReceiverPDU.entityId;
var rPDUradioID = disReceiverPDU.radioId;
console.log("Sending Transmitter:", rPDUentityID, "Radio", rPDUradioID);


/**
 * Encode the PDU intoto networkbuffer:
 */
var entPdu = utils.DISPduToBuffer(disEntityStatePDU);
var tranPdu = utils.DISPduToBuffer(disTransmitterPDU);
var sigPdu = utils.DISPduToBuffer(disSignalPDU);
var recPdu = utils.DISPduToBuffer(disReceiverPDU);

/**
 * Send the message on network and finish
 */
client.send(entPdu, 0, entPdu.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ port);
});

client.send(tranPdu, 0, tranPdu.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ port);
});

client.send(sigPdu, 0, sigPdu.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ port);
});

client.send(recPdu, 0, sigPdu.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ port);
    client.close();
});
