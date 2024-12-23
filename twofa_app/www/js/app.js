let app = {
    init: function () {
        localStorage.setItem('otps', '[]'); // debug purposes
        document.querySelector("#btn_scanner").addEventListener("click", app.handleButtonClick);
        app.displayOtps();
    },
    handleButtonClick: function () {

        let permissions = cordova.plugins.permissions;
        permissions.checkPermission(permissions.CAMERA, function (status) {
            if (status.hasPermission) {
                app.scanQRCode();
            } else {
                app.requestCameraPermission();
            }
        });
    },
    requestCameraPermission: function () {

        let permissions = cordova.plugins.permissions;
        permissions.requestPermission(permissions.CAMERA, function (status) {
            if (status.hasPermission) {
                console.log("Permission granted");
                app.scanQRCode();
            } else {
                console.error("Permission denied");
                alert("Camera access is required to scan a QR code. Please enable it in your app settings.");
            }
        });
    },
    scanQRCode: function () {
        // GUESS WHO HAD TO SWITCH LIBRARIES LIKE 5 TIMES
        QRScanner.prepare(function (err, status) {
            if (err) {
                console.error("QRScanner prepare error: ", err);
                alert("Failed to prepare scanner: " + err.message);
                return;
            }

            if (status.authorized) {
                // Start scanning
                QRScanner.scan(function (err, text) {
                    if (err) {
                        app.handleScanError(err);
                    } else {
                        app.handleScanSuccess({ text: text, cancelled: false });
                    }
                });

                // Make the scanner visible
                QRScanner.show();
            } else if (status.denied) {
                alert("Camera access was denied permanently. Please enable it in the device settings.");
            } else {
                alert("Camera access was denied temporarily.");
            }
        });
    },
    handleScanSuccess: function (result) {

        if (!result.cancelled) {
            console.log("QR Code scanned:", result.text);
            let data = app.decodeOtpString(result.text.trim());

            console.log(data);

            if (data === false) {
                alert("Invalid QR Code, please check you're scanning a correct one, and if it is, report it to TOMASS.TRBS@eduge.ch as this might be a bug.");
                return;
            }

            app.saveOtpToMemory(data);

            console.log(localStorage.getItem('opts'));

            // Re-displays all OTPs
            app.displayOtps();

            // Hide the scanner after success
            QRScanner.hide();
        } else {
            console.log("User cancelled the scan.");
            QRScanner.hide(); // Hide the scanner even if cancelled
        }
    },
    handleScanError: function (error) {
        console.error("Error scanning QR Code:", error);
    },
    decodeOtpString: function (otpAuthString) {
        try {
            // Ensure the string starts with 'otpauth://'
            if (!otpAuthString.startsWith('otpauth://')) {
                return false;
            }

            // Convert 'otpauth://' to 'https://' to make it parsable by URL
            const url = new URL(otpAuthString.replace('otpauth://', 'https://'));

            const pathParts = url.pathname.slice(1).split(':');
            if (pathParts.length !== 2) {
                return false; // Invalid format for issuer and account
            }

            const issuerAndAccount = {
                issuer: pathParts[0], // The issuer (issuer_app_name)
                account: pathParts[1], // The account (user@email.com)
            };

            // Parse the various query parameters
            const params = new URLSearchParams(url.search);
            const secret = params.get('secret');
            const issuer = params.get('issuer');
            const algorithm = params.get('algorithm') || 'sha1'; // Default to 'sha1' if missing
            const digits = params.get('digits') ? parseInt(params.get('digits'), 10) : 6; // Default to 6 if missing
            const period = params.get('period') ? parseInt(params.get('period'), 10) : 30; // Default to 30 if missing

            // If 'secret' or 'issuer' is missing, return false as they are essential
            if (!secret || !issuer) {
                return false;
            }

            return {
                ...issuerAndAccount,
                secret,
                issuer,
                algorithm,
                digits,
                period,
            };

        } catch (error) {
            // If any error occurs in parsing (ex: invalid URL structure), return false
            return false;
        }
    },
    loadOtpsFromMemory: function () {
        let otps = localStorage.getItem('otps');
        if (otps == '[object Object]') {
            return [];
        }
        return otps ? JSON.parse(otps) : []; // empty array if no OTPs yet
    },
    saveOtpToMemory: function (data) {
        let otps = app.loadOtpsFromMemory();
        console.log(otps);
        otps.push(data);
        console.log(otps);
        localStorage.setItem('otps', JSON.stringify(otps));
    },
    displayOtps: function () {
        let otps = app.loadOtpsFromMemory();

        console.log(otps);

        let listInfos = document.querySelector("#mains_infos ul");

        console.log(listInfos);

        listInfos.innerHTML = "";

        for (const otp of otps) {

            let li = document.createElement('li');
            let p = document.createElement('p');
            let span = document.createElement('span');

            li.appendChild(p);
            li.appendChild(span);

            p.textContent = otp.issuer;
            span.innerHTML = app.getTotp(otp.secret, null, otp.digits);

            // align with the next period
            let currentTime = Math.floor(Date.now() / 1000);
            let nextInterval = otp.period - (currentTime % otp.period);



            setTimeout(() => {
                span.innerHTML = app.getTotp(secret);
                setInterval(() => {
                    span.innerHTML = app.getTotp(secret);
                }, otp.period * 1000);
            }, nextInterval * 1000);

            listInfos.appendChild(li);

            console.log(li);

        }

    },
    getTotp: function (key, period = 30, length = 6, algorithm = 'SHA1') {
        const keyBytes = app.base32Decode(key);
        const timeStep = Math.floor(Date.now() / 1000 / period);

        const timeStepBytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
            timeStepBytes[7 - i] = (timeStep / Math.pow(256, i)) & 0xFF;
        }

        // HMAC using the specified algorithm
        let hmacHash;
        switch (algorithm.toUpperCase()) {
            case 'SHA1':
                hmacHash = CryptoJS.HmacSHA1(
                    CryptoJS.lib.WordArray.create(timeStepBytes),
                    CryptoJS.lib.WordArray.create(keyBytes)
                );
                break;
            case 'SHA256':
                hmacHash = CryptoJS.HmacSHA256(
                    CryptoJS.lib.WordArray.create(timeStepBytes),
                    CryptoJS.lib.WordArray.create(keyBytes)
                );
                break;
            case 'SHA512':
                hmacHash = CryptoJS.HmacSHA512(
                    CryptoJS.lib.WordArray.create(timeStepBytes),
                    CryptoJS.lib.WordArray.create(keyBytes)
                );
                break;
            default:
                alert('Unsupported hashing algorithm, please send an email to TOMASS.TRBS@eduge.ch to add support for it.');
                return "";
            }

        const hmacBytes = Uint8Array.from(CryptoJS.enc.Hex.parse(hmacHash.toString(CryptoJS.enc.Hex)).words.flatMap(word => [
            (word >>> 24) & 0xFF,
            (word >>> 16) & 0xFF,
            (word >>> 8) & 0xFF,
            word & 0xFF
        ]));

        const offset = hmacBytes[hmacBytes.length - 1] & 0x0F;
        const dbc = ((hmacBytes[offset] & 0x7F) << 24) |
            (hmacBytes[offset + 1] << 16) |
            (hmacBytes[offset + 2] << 8) |
            (hmacBytes[offset + 3]);

        const totp = dbc % Math.pow(10, length);
        return totp.toString().padStart(length, "0");
    },
    base32Decode: function (key) {
        const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        key = key.toUpperCase().replace(/=/g, "");
        let bits = "";

        for (let char of key) {
            const index = base32Alphabet.indexOf(char);
            if (index === -1) {
                throw new Error("Invalid base32 key");
            }
            bits += index.toString(2).padStart(5, '0');
        }

        const bytes = [];
        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.slice(i, i + 8);
            if (byte.length === 8) {
                bytes.push(parseInt(byte, 2));
            }
        }

        return Uint8Array.from(bytes);
    }
};

document.addEventListener('deviceready', app.init)
