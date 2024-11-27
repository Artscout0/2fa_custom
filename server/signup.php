<?php

use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Tomasst\TotpServer\Models\User;
use Tomasst\TotpServer\Utils\Totp;

$email = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
$password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$secret = filter_input(INPUT_POST, "secret", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$auth_code = filter_input(INPUT_POST, "auth_code", FILTER_SANITIZE_FULL_SPECIAL_CHARS);

$showForm = true;
$errors = [];

if (isset($email, $password)) {
    require 'vendor/autoload.php';

    $user = new User();
    $totp = new Totp();

    $userExists = $user->SelectUserByEmail($email);

    // happy path user works
    if (isset($secret, $auth_code)) {

        $showForm = false;

        $user->InsertNewUser([":email" => $email, ":password_hash" => password_hash($password, PASSWORD_DEFAULT), ":user_secret" => $secret]);

        if ($totp->validateToken($secret, $auth_code)) {
            header("Location: index.php");
        } else {
            $errors[] = "2fa code expired or incorrect.";
        }
    }

    // unhappy path user with email aleready exists
    if ($userExists) {
        $errors[] = "Email already in database. Please try again, or proceed to <a href='index.php'>login</a>.";
    }

    // happy path user is getting created. I don't think this is propper english.
    if (count($errors) <= 0) {

        $showForm = false;

        $secret = isset($secret) ? $secret : Totp::GenerateSecret();

        $issuer = 'Tribis-Gerber-2fa-App';
        $accountName = $email;
        $qrCodeData = "otpauth://totp/{$issuer}:{$accountName}?secret={$secret}&issuer={$issuer}&algorithm=" . totp::DEFAULT_ALGORITHM . "&digits=" . Totp::DEFAULT_DIGITS . "&period=" . Totp::DEFAULT_INTERVAL;

        $writer = new PngWriter();

        $qrCode = new QrCode($qrCodeData, new Encoding('UTF-8'), ErrorCorrectionLevel::Low, 500, 10);

        $res = $writer->write($qrCode);
        
        $imgdata = base64_encode($res->getString());

    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
</head>

<body>
    <div class="container">
        <h1 class="centered">Sign up here:</h1>

        <?php if (count($errors) > 0) { ?>
            <div>
                <?php foreach ($errors as $error) { ?>
                    <div class="alert alert-danger">
                        <?= $error ?>
                    </div>
                <?php } ?>
            </div>
        <?php } ?>

        <?php if ($showForm) { ?>

            <form method="post" class="form-horizontal">
                <div class="form-group">
                    <label class="control-label col-sm-3" for="email">Your email:</label>
                    <div class="col-sm-9">
                        <input type="email" name="email" id="email" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="control-label col-sm-3" for="password">Your password:</label>
                    <div class="col-sm-9">
                        <input type="password" name="password" id="password" required>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                        <strong><input type="submit" value="Sign up" class="btn btn-default"></strong>
                    </div>
                </div>
            </form>
        <?php } else { ?>
            <p>Scan the following QRCode in your prefered authenticator app, as on login you'll need to check the data saved on your account.</p>
            <img src="data:image/png;base64,<?= $imgdata ?>" alt="<?= $secret ?>">
            <p>Alternatively, write down the following characters: <i><?= $secret ?></i> , and write them into you preferred authenticator app.</p>

            <form method="post">
                <input type="hidden" name="email" id="email" required value="<?=$email?>">
                <input type="hidden" name="password" id="password" required value="<?=$password?>">
                <input type="hidden" name="secret" id="secret" required value="<?=$secret?>">

                <div class="form-group">
                    <label class="control-label col-sm-3" for="password">Afterwards, input the code into here:</label>
                    <div class="col-sm-9">
                        <input type="number" name="auth_code" id="auth_code" required>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                        <strong><input type="submit" value="Sign up" class="btn btn-default"></strong>
                    </div>
                </div>
            </form>
        <?php } ?>
    </div>
</body>

</html>