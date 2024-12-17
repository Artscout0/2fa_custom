const { default: Totp } = require("./Totp_implementation/Totp.js");

let app = {
    init: function () {
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

        cordova.plugins.barcodeScanner.scan(
            app.handleScanSuccess,
            app.handleScanError,
            {
                preferFrontCamera: false,
                showFlipCameraButton: true,
                showTorchButton: true,
                torchOn: false,
                prompt: "Place a QR code inside the scan area",
                resultDisplayDuration: 500,
                formats: "QR_CODE",
                orientation: "portrait",
                disableAnimations: true,
                disableSuccessBeep: false
            }
        );
    },
    handleScanSuccess: function (result) {

        if (!result.cancelled) {
            console.log("QR Code scanned:", result.text);
            let data = app.decodeOtpString(result.text);

            if (data === false) {
                alert("Invalid QR Code, please check you're scanning a correct one, and if it is, report it to TOMASS.TRBS@eduge.ch as this might be a bug.");
                return;
            }

            app.saveOtpToMemory(data);
            // re-displays all otps
            app.displayOtps();
        } else {
            console.log("User cancelled the scan.");
            return;
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
        return otps ? JSON.parse(otps) : []; // empty array if no OTPs yet
    },
    saveOtpToMemory: function (data) {
        let otps = app.loadOtpsFromMemory();
        otps.push(data);
        JSON.stringify(otps);
        localStorage.setItem('otps', otps);
    },
    displayOtps: function () {
        let otps = app.loadOtpsFromMemory();

        let listInfos = document.querySelector("#mains_infos>ul");

        listInfos.innerHTML = "";

        for (const otp of otps) {
            let totp = new Totp(otp.algorithm, 0, otp.period);

            let li = document.createElement('li');
            let p = document.createElement('p');
            let span = document.createElement('span');

            li.appendChild(p);
            li.appendChild(span);

            p.innerHTML = otp.issuer;
            span.innerHTML = totp.generateToken(otp.secret);

            setInterval(() => { span.innerHTML = totp.generateToken(otp.secret) }, otp.period * 1000);

            listInfos.appendChild(li);
        }

    }
};

document.addEventListener('deviceready', app.init)