const dgram = require('dgram');
const os = require('os');
const { UUID, setShard } = require('./uuid');

const values = (o) => Object.keys(o).sort().map((k) => o[k]);

const {
    STORYMAKER_UDP_HOST = '230.230.230.230',
    STORYMAKER_UUID_SHARD
} = process.env;

const STORYMAKER_UDP_PORT = Number(process.env.STORYMAKER_UDP_PORT || 60542);
const STORYMAKER_UDP_TTL = Number(process.env.STORYMAKER_UDP_TTL || 1);
const STORYMAKER_UDP_FREQ = Number(process.env.STORYMAKER_UDP_FREQ || 5 * 1000);
const STORYMAKER_UDP_EXPIRE = Number(process.env.STORYMAKER_UDP_EXPIRE || STORYMAKER_UDP_FREQ * 3);
const STORYMAKER_MIN_PORT = Number(process.env.STORYMAKER_MIN_PORT || 4200);
const STORYMAKER_MAX_PORT = Number(process.env.STORYMAKER_MAX_PORT || 4299);

setShard(STORYMAKER_UUID_SHARD);

const DEF_NAME = 'things';
const DEF_VERSION = '0.0.1';
const MSG_NONCE = 'service:nonce';
const MSG_AVAILABLE = 'service:available';
const MSG_UNAVAILABLE = 'service:unavailable';
const ID = UUID();
const HOST_IP = values(os.networkInterfaces()).map(
    (i) => i.filter(
        (a) => !a.internal && a.family === 'IPv4'
    ).reduce(
        (p, a) => p || a.address, null
    )
).filter(Boolean)[0] || '127.0.0.1';

const assignPort = () => Math.floor(Math.random() * (STORYMAKER_MAX_PORT - STORYMAKER_MIN_PORT + 1) + STORYMAKER_MIN_PORT);
const registry = { index: new Map(), data: [] };
const serviceKey = ({ name, version, host, port }) => `${name}@${version}//${host}:${port}`;
const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
const send = (type = MSG_NONCE, services) => {
    const buff = new Buffer(JSON.stringify({ type, from: ID, services }));
    socket.send(buff, 0, buff.length, STORYMAKER_UDP_PORT, STORYMAKER_UDP_HOST);
};
const register = (service) => {
    const key = serviceKey(service);
    let entry = registry.index.get(key);
    if (!entry) {
        entry = Object.assign({ key }, service);
        registry.index.set(key, entry);
        registry.data.push(entry);
    }
    entry.expires = Date.now() + STORYMAKER_UDP_EXPIRE;
};
const deregister = (service) => {
    const key = serviceKey(service);
    const entry = registry.index.get(key);
    if (!entry) { return; }
    registry.index.delete(key);
    registry.data = registry.data.filter((e) => e !== entry);
};
const expire = () => {
    const now = Date.now();
    registry.data.filter((e) => e.expires <= now).forEach(deregister);
};
const parseMessage = (buff) => {
    const msg = buff.toString();
    try {
        console.log(`parseMessage: ${msg}`);
        const { type, from, services } = JSON.parse(msg);
        if (from === ID) { return; }
        switch(type) {
        case MSG_AVAILABLE:
            console.log(`MSG_AVAILABLE: ${from} ${services}`);
            services.map(register);
            break;
        case MSG_UNAVAILABLE:
            console.log(`MSG_UNAVAILABLE: ${from} ${services}`);
            services.map(deregister);
            break;
        default:
            console.log(`MSG_DEFAULT: ${from} ${services}`);
            return;
        }
    } catch(ignore) {}
};
socket.bind(STORYMAKER_UDP_PORT);
socket.once('listening', () => {
    socket.setMulticastLoopback(true);
    socket.setMulticastTTL(STORYMAKER_UDP_TTL);
    socket.addMembership(STORYMAKER_UDP_HOST);
    socket.on('message', parseMessage);
    setInterval(expire, STORYMAKER_UDP_FREQ / 2);
});

const start = ({ name = DEF_NAME, version = DEF_VERSION, host = HOST_IP, port = assignPort() } = {}) => {
    const announce = () => send(MSG_AVAILABLE, [{ from: ID, name, version, host, port }]);
    announce();
    const interval = setInterval(announce, STORYMAKER_UDP_FREQ);
    return () => {
        clearInterval(interval);
        send(MSG_UNAVAILABLE, [{ name, version, host, port }]);
    };
};

module.exports = Object.freeze({ start });