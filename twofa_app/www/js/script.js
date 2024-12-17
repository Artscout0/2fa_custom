let btnAccessScann = document.querySelector('#btn_scanner button');
let btnBack = document.querySelector('#btn_retour');

btnAccessScann.addEventListener('click', event => {
    document.querySelector('#infos').style.display = "none";
    document.querySelector('#generate-QRCode').style.display = "flex";

})

btnBack.addEventListener('click', event => {
    document.querySelector('#infos').style.display = "flex";
    document.querySelector('#generate-QRCode').style.display = "none";

})