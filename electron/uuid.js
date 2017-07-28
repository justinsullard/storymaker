/*eslint no-bitwise: 0, prefer-template: 0 */
let THINGS_UUID_SHARD = '000';

const R = Math.random;
const D = () => (R()*16|0).toString(16); // 0-f
const B = () => (R()*16|0&0x3|0x8).toString(16); // 8-b
const UUID = () => {
    const t = ('000000000000'+new Date().getTime().toString(16)).slice(-12);
    return t.slice(0, 8)+
        '-'+t.slice(-4)+
        '-6'+THINGS_UUID_SHARD+
        '-'+B()+D()+D()+D()+
        '-'+D()+D()+D()+D()+D()+D()+D()+D()+D()+D()+D()+D();
};

const getShard = () => THINGS_UUID_SHARD;
const setShard = (shard) => THINGS_UUID_SHARD = `000${`${shard}`.replace(/[^0-9a-f]/g, '')}`.slice(-3).toLowerCase();

module.exports = Object.freeze({ UUID, getShard, setShard });
