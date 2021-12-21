'use strict';
// Credits: 
// https://nodejs.org/api/webcrypto.html#cryptosubtle
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
const { subtle } = require('crypto').webcrypto;
module.exports = async function digest(message, algorithm = 'SHA-512') {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await subtle.digest(algorithm, msgUint8);                  // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}