const dgram = require('dgram');
const dis = require("open-dis");
const argv = require('yargs').argv;
const WaveFile = require('wavefile').WaveFile;
const DISUtils = require('./DISUtils');
const fs = require('fs');
const path = require('path');
var utils = new DISUtils();

// Defaults
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 9000;
const DEFAULT_TIME = 1;
const DEFAULT_KHZ = 8000;
const DEFAULT_DEPTH = 16;

// Sending info
var host = argv.host || DEFAULT_HOST;
var port = argv.port || DEFAULT_PORT;
// Test file generation info
var time = argv.time || DEFAULT_TIME;
var fileName = argv.tName || undefined;
var khz = argv.khz || DEFAULT_KHZ;
var depth = argv.depth || DEFAULT_DEPTH;

if(fileName) {
    createTestFile(fileName, time, depth, khz);
}

// Get the test audio file and convert to Binary Array
var filepath = path.join(__dirname, 'suspended.wav');
try {
    // Sound file buffer
    var sfBuffer = fs.readFileSync(filepath);
    // Convert buffer to wave file
    var wav = new WaveFile(sfBuffer);
    var samples = wav.getSamples(false, Uint16Array);
    var pduStream = prepSigPDUs(samples);
    var pduSample = [pduStream[0], pduStream[pduStream.length-1]];
    console.log(pduSample);
    sendPDUs(pduStream);
} catch (e) {
    console.log(e);
}

// This function takes in an array of audio samples and prepares them to be sent as DIS Signal Packets
function prepSigPDUs(samples) {
    var cntr = 0;
    var pduData = [];
    var sPdu = new dis.SignalPdu();

    console.log(samples.slice(0,1));

    samples.forEach((sample, key) => {
        // Something is wrong with how I'm setting up my data, need to figure this one out
        // Alloc buffer with 2 bytes to store a Uint16
        console.log("Raw sample data:", sample);
        var buf = Buffer.alloc(2); // alloc 2 bytes
        console.log("Init'd buf:", buf);
        // Use the 2 bytes to store the UInt16
        buf.writeUInt16BE(sample); // write uint16
        console.log("Written buf:", buf);
        var bytes = new Uint8Array(buf, 0, 2); 
        console.log("Split buf:", bytes);
        bytes.forEach((byte, idx) => {
            console.log("Before the byte goes in:", byte);
            var chunk = new dis.Chunk(1);
            chunk.initFromBinaryDIS(byte.toString(2));
            sPdu.data.push(chunk);
        });
        cntr++;
        if(cntr >= 320 || key === samples.length - 1) {
            var timestamp = new Date().getTime();
            sPdu.entityId.site = 1;
            sPdu.entityId.application = 1;
            sPdu.entityId.entity = 932;
            sPdu.exerciseID = 1;
            sPdu.timestamp = timestamp;
            sPdu.encodingScheme = 4;
            sPdu.radioId = 1;
            sPdu.samples = cntr;
            sPdu.sampleRate = 8000;
            sPdu.tdlType = 0;
            sPdu.dataLength = cntr * 16;
            // Header will always be 32 bytes
            sPdu.pduLength = 32 + (sPdu.dataLength / 8);
            // Add the pdu to the array or perped pdu's
            pduData.push(sPdu);
            sPdu = new dis.SignalPdu();
            cntr = 0;
        }
    });
    // Return the array of created PDU's to be sent later
    return pduData;
}
// This funciton takes in an array of prepared PDU's and will send them based on command line args
function sendPDUs(pduArray) {
    var client = dgram.createSocket('udp4'); // Open a UDP IPv4 Client
    //TODO: Send a transmitter pdu that says you're transmitting
    var txStartPdu = new dis.TransmitterPdu();

    pduArray.forEach((pdu, key) => {
        var pduBuf = utils.DISPduToBuffer(pdu);
        client.send(pduBuf, 0, pduBuf.length, port, host, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + host +':'+ port);
        });
    });
    //TODO: Send a transmitter PDU
    var txEndPdu = new dis.TransmitterPdu();
}
function createTestFile (name, time, depth, khz) {
    // Calc the max value of a sample based on depth
    var rng = 0;
    for(var y=0;y<depth-1;y++){
        rng += Math.pow(2, y);
    }
    // Create all the samples
    var samples = [];
    for(var i=0;i<=khz*time-1;i++) {
        var x = Math.trunc(Math.random()*rng);
        samples.push(x);
    }
    // Add samples to the file
    var wav = new WaveFile();
    wav.fromScratch(1, khz, depth, samples);
    // Write the wav file
    fs.writeFileSync(name, wav.toBuffer());
}