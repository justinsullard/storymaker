/*eslint no-bitwise: 0 */
const net = require('net');
const crypto = require('crypto');

const bigEndian = (value) => [
    String.fromCharCode(value >> 24 & 0xFF),
    String.fromCharCode(value >> 16 & 0xFF),
    String.fromCharCode(value >> 8 & 0xFF),
    String.fromCharCode(value & 0xFF)
].join('');


function computeKey(key) {
    const length = parseInt(key.match(/\s/g).length);
    const chars = parseInt(key.replace(/[^0-9]/g, ''));
    return chars / length;
}

// protocol 00
// http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-00
const HandshakeHYBI00 = (request) => {
    // split up lines and parse
    const lines = request.split('\r\n');
    const headers = parseHeaders(lines);
    if ('sec-websocket-key1' in headers && 'sec-websocket-key2' in headers) {
        const key1 = computeKey(headers['sec-websocket-key1']);
        const key2 = computeKey(headers['sec-websocket-key2']);
        /*
         * The third piece of information is given
         * after the fields, in the last eight
         * bytes of the handshake, expressed here
         * as they would be seen if interpreted as ASCII
         */
        const data = request.slice(-8, request.length);
        // md5 hhash
        const hash = crypto.createHash('md5');
        // update hash with all values
        hash.update(bigEndian(key1));
        hash.update(bigEndian(key2));
        hash.update(data);
        // TODO: make this a template maybe
        var response = [
            'HTTP/1.1 101 WebSocket Protocol Handshake',
            'Upgrade: WebSocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Origin: ${headers.origin}`,
            // TODO: ws or wss
            // TODO: add actual request path
            `Sec-WebSocket-Location: ws://${headers.host}/`,
            '',
            hash.digest('binary')
        ];
        return response;
    }
    return false;
};

function parseHeaders(headers) {
    // splits a list of headers into key/value pairs
    var parsedHeaders = {};

    headers.forEach(function(header) {
        // might contain a colon, so limit split
        var toParse = header.split(':');
        if (toParse.length >= 2) {
            // it has to be Key: Value
            var key = toParse[0].toLowerCase(),
                // might be more than 1 colon
                value = toParse.slice(1).join(':')
                    .replace(/^\s\s*/, '')
                    .replace(/\s\s*$/, '');
            parsedHeaders[key] = value;
        }
        else {
            // it might be a method request,
            // which we want to store and check
            if (header.indexOf('GET') === 0) {
                parsedHeaders['X-Request-Method'] = 'GET';
            }
        }
    });

    return parsedHeaders;
}

var WebsocketServer = net.createServer(function (socket) {
    // listen for connections
    var wsConnected = false;

    socket.addListener('data', function (data) {
        // are we connected?
        if (wsConnected) {
            console.log(data.toString('utf8'));
        }
        else {
            var response = HandshakeHYBI00(data.toString('binary'));
            if (response) {
                // handshake succeeded, open connection
                socket.write(response.join('\r\n'), 'binary');
                wsConnected = true;
            }
            else {
                // close connection, handshake bad
                socket.end();
                return;
            }
        }
    });

});

WebsocketServer.listen(8080, "127.0.0.1");