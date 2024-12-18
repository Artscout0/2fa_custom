import Base32 from "./Base32.js";
import Hotp from "./Hotp.js";

export default class Totp extends Hotp {
    static DEFAULT_ALGORITHM = 'SHA1';
    static DEFAULT_DIGITS = 6;
    static DEFAULT_INTERVAL = 30;
    static DEFAULT_START_TIME = 0;
    static ACCEPTED_PERIODS = 1; // ±n periods

    constructor(algo = Totp.DEFAULT_ALGORITHM, start = Totp.DEFAULT_START_TIME, interval = Totp.DEFAULT_INTERVAL) {
        super(algo); // Call the parent (Hotp) constructor
        this.startTime = start;
        this.timeInterval = interval;
    }

    // Generate an otp
    generateToken(key, time = null, length = Totp.DEFAULT_DIGITS) {
        // Decode the Base32 key
        console.log(key);
        
        key = Base32.decode(key);

        // Use current time if no specific time is provided
        if (time === null) {
            time = Math.floor(Date.now() / 1000);
        }

        // time-based counter
        const count = Math.floor((time - this.startTime) / this.timeInterval);

        // Generate the OTP based on HOTP (calling the parent class method)
        return this.generateToken(key, count, length); // Use the HOTP logic from the parent class
    }
}