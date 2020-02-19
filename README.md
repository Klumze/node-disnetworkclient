# node-disnetworkclient
Example implementations for UDP client/server exchanging DIS (Distributed Interactive Simulation) packages using [open-dis-javascript](https://github.com/open-dis/open-dis-javascript) with node.js

This examples may help as a starting-point to use open-dis-javascript yourself,
giving a basic introduction, in how to use the DIS PDUs, and handling the different
Buffers

## Dependencies

Before starting, please install the following software:

 - [node.js](https://nodejs.org/en/)
 - [git](https://git-scm.com/downloads)

## Installation

Get the source:

```
git clone https://github.com/keckxde/node-disnetworkclient.git
```

Install the dependencies:

```
cd node-disnetworkclient
npm install
```

## Run the examples

### Example Server

Run the Server - by default listening on port 3000

```
npm run-script server
```

Result:
```
> node src/dis-udpserver.js

server listening 0.0.0.0:3000
```

### Example Client

Run the Client - by default sending to localhost:3000

```
npm run-script client
```

Result:
```
> node src/dis-udpclient.js

UDP message sent to 127.0.0.1:3000
```

### Verify the Message was received by the Server:

After that, you will see, a DIS EntityState PDU was sent to server

```
server got msg from 127.0.0.1:64528
Got EntityState: { site: 11, application: 22, entity: 33 } Location { x: 0, y: 0, z: 0 } 
Marking
```

## Write your own client

See example implementation in [dis-udpclient.js](./src/dis-udpclient.js) as a starting point


## Write your own server


See example implementation in [dis-udpserver.js](./src/dis-udpserver.js) as a starting point

## Changes by Michael P.

To get things working with my changes you'll need to grab the latest version of the open-dis library (v1.3.1 at the current time) as well as Wavefile from NPM.

You can create sample audio files by providing a name to --tFile. By dfault this will create a 1 second 8000khz 16bit PCM audio file but these values can be adjusted with --tTime --tKhz and --tDepth.

To send the audio file provide the name as a command line argument (--sFile).
