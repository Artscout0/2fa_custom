export default class Hotp {
    constructor(algo = 'SHA1') {
        this.algorithm = algo; // HMAC algorithm (SHA1 by default)
    }

    // Pack the counter into an 8-byte buffer
    packCounter(counter) {
        const buffer = new Array(8); // Create an array of 8 bytes

        for (let i = 7; i >= 0; i--) {
            buffer[i] = counter & 0xff; // Get the least significant byte
            counter = counter >> 8; // Shift counter to the right by 8 bits
        }

        return buffer;
    }

    // Generate HMAC using CryptoJS
    generateHMAC(key, counter) {
        // Convert counter array to WordArray (CryptoJS compatible)
        const counterWordArray = CryptoJS.enc.Utf8.parse(counter.map(byte => String.fromCharCode(byte)).join(''));

        // Generate HMAC using CryptoJS
        const hmac = CryptoJS.HmacSHA1(counterWordArray, key); // Use specified algorithm (default SHA1)
        return hmac.toString(CryptoJS.enc.Hex); // Return the HMAC in hex format
    }

    // Generate the HOTP value from the hash
    genHOTPValue(hash, length) {
        const hmacBytes = [];
        for (let i = 0; i < hash.length; i += 2) {
            hmacBytes.push(parseInt(hash.substr(i, 2), 16)); 
        }

        const offset = hmacBytes[hmacBytes.length - 1] & 0xf; 

        // Extract 4 bytes starting at the offset
        const code =
            ((hmacBytes[offset] & 0x7f) << 24) |
            ((hmacBytes[offset + 1] & 0xff) << 16) |
            ((hmacBytes[offset + 2] & 0xff) << 8) |
            (hmacBytes[offset + 3] & 0xff);

        return code % Math.pow(10, length); 
    }

    generateToken(key, count = 0, length = 6) {
        const counterBuffer = this.packCounter(count); 
        const hash = this.generateHMAC(key, counterBuffer); 

        let code = this.genHOTPValue(hash, length); 
        return code.toString().padStart(length, '0'); 

        return code;
    }
}