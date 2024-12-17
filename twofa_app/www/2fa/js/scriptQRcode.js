let btnGenerer = document.querySelector('#btnGenerer');

// //Paramètre du qrcode
// let qrcode = new QRCode(document.querySelector("#qrcode"), {
//     width: 128,
//     height: 128,
//     colorDark : "#000000",
//     colorLight : "#ffffff",
//     correctLevel : QRCode.CorrectLevel.H
// })

// //génération du qrcode
// function makeCode () {    
//   let elText = document.querySelector("#text");
  
//   if (!elText.value) {
//     alert("Input a text");
//     elText.focus();
//     return;
//   }
  
//   qrcode.makeCode(elText.value);
// }

// btnGenerer.addEventListener('click', event => {
//     makeCode();
// })

//SCANNER

let btnScanner = document.querySelector('#btnScanner');

btnScanner.addEventListener('click', event => {
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 100, height: 100} },
        /* verbose= */ false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
})
function onScanSuccess(decodedText, decodedResult) {
    // handle the scanned code as you like, for example:
    alert(decodedText);
    // console.log(`Code matched = ${decodedText}`, decodedResult);
    // document.querySelector("#text").value = decodedText;
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
    //alert('Code scan error = ${error}');
}







