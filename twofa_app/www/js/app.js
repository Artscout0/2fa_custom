let app = {
    init: function () {
        // sur click du boutton, on verifie les permissions, et on prend une photo. Ca marche dans cet ordre, 
        // je n'ai pas verifié dans l'autre et honetement j'ai peur de le fair. 
        document.querySelector("#btn").addEventListener("click", app.takephoto)

        var permissions = cordova.plugins.permissions;

        // Verifier permissions
        permissions.requestPermission(permissions.CAMERA, function (status) {
            if (status.hasPermission) {
                console.log("Permission granted");
            } else {
                console.log("Permission denied");
            }
        });

    },
    takephoto: function () {

        // configure quelque options, et prends une photo
        let options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL, // Image en b64. Si on mets FILE_URI, donc le nom du fichier, ca bug. NATIVE_URI pas teste.
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
        }

        navigator.camera.getPicture(app.ftw, app.wtf, options);
    },
    ftw: function (imageData) {

        // photo a ete prise
        document.querySelector("#photo").src = imageData;

        app.scanQRCode(imageData);
    },
    wtf: function (msg) {
        // photo pas ete prise
        document.querySelector("#msg").innerHTML = msg;
    },
    scanQRCode: function (imageURI) {
        // I think you can guess what needs to be done here
    }
}

document.addEventListener('deviceready', app.init)

