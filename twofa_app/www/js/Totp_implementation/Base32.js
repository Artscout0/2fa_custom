export default class Base32 {
    static BITS_5_RIGHT = 0b11111; // constant value for 5 bits
    static BITS_8 = 0xff; // constant value for an 8 bit mask
    static CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // upper case cause it looks nicer, and the other dev doesn't mind

    /**
     * 
     * @param {String} data 
     * @param {bool} padRight 
     */
    static encode(data, padRight = false) {
        const dataSize = data.length;
        let res = "";
        let remainder = 0;
        let remainderSize = 0;

        for (let i = 0; i < dataSize; i++) {
            const b = ord(i); // Equivalent to PHP's ord()
            remainder = (remainder << 8) | b;
            remainderSize += 8;

            while (remainderSize > 4) {
                remainderSize -= 5;
                let c = remainder & (Base32.BITS_5_RIGHT << remainderSize);
                c >>= remainderSize;
                res += Base32.CHARS[c];
            }
        }

        if (remainderSize > 0) {
            remainder <<= (5 - remainderSize);
            const c = remainder & Base32.BITS_5_RIGHT;
            res += Base32.CHARS[c];
        }

        if (padRight) {
            const padSize = (8 - Math.ceil((dataSize % 5) * 8 / 5)) % 8;
            res += "=".repeat(padSize);
        }

        return res;
    }

    static decode(data) {
        // Trim padding and whitespace-like characters
        data = data.replace(/[=\x20\t\n\r\0\x0B]+$/g, "").trim();

        const charMap = {};
        // Build char=>value map for both upper and lower case
        Base32.CHARS.split("").forEach((char, index) => {
            charMap[char] = index;
            charMap[char.toLowerCase()] = index;
        });

        let buf = 0;
        let bufSize = 0;
        let res = "";

        for (let i = 0; i < data.length; i++) {
            const c = data[i];
            if (!(c in charMap)) {
                // Ignore safe characters (space, newlines, etc.)
                if (c === " " || c === "\r" || c === "\n" || c === "\t") {
                    continue;
                }
                throw new Error(
                    `Encoded string contains unexpected char #${c.charCodeAt(0)} at offset ${i} (using improper alphabet?)`
                );
            }

            const b = charMap[c];
            buf = (buf << 5) | b;
            bufSize += 5;

            if (bufSize > 7) {
                bufSize -= 8;
                const byte = (buf & (Base32.BITS_8 << bufSize)) >> bufSize;
                res += String.fromCharCode(byte);
            }
        }

        return res;
    }
}

// needed a custom ord implementation cause JS and PHP's are different. So I stole it.
function ord(string) {
    //  discuss at: https://locutus.io/php/ord/
    // original by: Kevin van Zonneveld (https://kvz.io)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // improved by: Brett Zamir (https://brett-zamir.me)
    //    input by: incidence
    //   example 1: ord('K')
    //   returns 1: 75
    //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
    //   returns 2: 65536

    const str = string + ''
    const code = str.charCodeAt(0)

    if (code >= 0xd800 && code <= 0xdbff) {
        // High surrogate (could change last hex to 0xDB7F to treat
        // high private surrogates as single characters)
        const hi = code
        if (str.length === 1) {
            // This is just a high surrogate with no following low surrogate,
            // so we return its value;
            return code
            // we could also throw an error as it is not a complete character,
            // but someone may want to know
        }
        const low = str.charCodeAt(1)
        return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
        // Low surrogate
        // This is just a low surrogate with no preceding high surrogate,
        // so we return its value;
        return code
        // we could also throw an error as it is not a complete character,
        // but someone may want to know
    }

    return code
}