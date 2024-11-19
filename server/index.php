<?php
require "vendor/autoload.php";

use Tomasst\TotpServer\Totp;

$secret = Totp::GenerateSecret(16);
$token = (new Totp())->GenerateToken($secret);
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
        token: <?= $token ?>
    </p>

</body>

</html>