# 2fa_custom

A custom implementation of TOTP based on RFC 6238

## requirements

— l’application cliente en JavaScript peut être d ́eveloppee avec Cordova si cela permet une utilisation plus simple des lecteurs de codes QR 3

— l’application cliente doit fonctionner mˆeme hors–connexion

— le temps Epoch (unix time)  ́etant la cle de voˆute de cette architecture, vos applica-tions devront calculer le delta entre l’heure système et le temps Epoch fourni par le service web <https://worldtimeapi.org/api/timezone/Europe/Zurich>; ce delta sera donc conserve dans le localStorage pour l’application cliente, car la connexion ne sera pas toujours garantie ; pour le script PHP, on peut imaginer une valeur static qui sera mise à jour au premier chargement du script, puis mise à jour chaque heure par une tâche cron

— les valeurs par d ́efaut de la RFC seront utilis ́ees (fenˆetre de validit ́e de 30”, SHA1, 6 digits), mais votre application devra  fonctionner avec des variantes (15” et 60”, SHA256 et SHA512, 4 et 8 digits) ; ces valeurs doivent ˆetre des constantes dans votre script PHP
(elles figureront ensuite dans le code QR qui sera scann ́e par l’application cliente)

— pour g ́en ́erer le code QR en PHP, on peut utiliser endroid/qr-code comme dans l’exer-cice pr écédent

— vous aurez besoin d’une bibliothèque pour calculer le hash SHA1/256/512 ; CryptoJS 4
fournit ces fonctions ; en PHP, la fonction native hash faisant l’affaire
— la RFC fournit des exemples d’impl ́ementation en Java ; les traduire en JavaScript et
PHP de nos jours ne devrait pas ˆetre d’une grande difficult ́e avec les IA.
— le script PHP doit accepter les codes de ±n p ́eriodes (constante du script) ; si n = 0 seul le code de la p ́eriode actuelle pour le serveur sera accept ́e, si n = 1 le code de la p ́eriode
actuelle pour le serveur sera accept ́ee ainsi que celui de celle qui suit et qui pr ́ecède (par défaut, nous aurons n = 1)
— vos applications seront d ́eploy ́ees sur <https://devmob.ictge.ch/>
— on peut comparer le code g ́en ́er ́e par l’application cliente et le code calculé par Google Authenticator pour un même code QR
