<?php
require "vendor/autoload.php";

use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Tomasst\TotpServer\Totp;

$secret = /*(new Totp())->GenerateSecret();*/ "JBSWY3DPEHPK3PXP" ;

$issuer = 'VotreApplication';
$accountName = 'user@example.com';
$qrCodeData = "otpauth://totp/{$issuer}:{$accountName}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=6&period=30";

$writer = new PngWriter();

$qrCode = new QrCode($qrCodeData, new Encoding('UTF-8'), ErrorCorrectionLevel::Low, 500, 10);

$res = $writer->write($qrCode);

$b64res = base64_encode($res->getString());

$token = (new Totp())->GenerateToken($secret);

$isValid = (new Totp())->validateToken($secret, $token, time(), 1);

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <p>

        secret: <?= $secret ?>
    </p>
    <p>
        <img src="data:image/png;base64,<?= $b64res ?>" alt="">

    </p>

    <p>

        token: <?= $token ?>
    </p>

    <p><?=$isValid ? "true":"false"?></p>
</body>

</html>