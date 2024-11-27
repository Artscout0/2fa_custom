<?php
require "vendor/autoload.php";

use Endroid\QrCode\QrCode;
use Tomasst\TotpServer\Models\User;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Tomasst\TotpServer\Utils\Totp;

$email = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
$password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$auth_code = filter_input(INPUT_POST, "auth_code", FILTER_SANITIZE_NUMBER_INT);

$errors = [];

if (isset($email, $password, $auth_code)) {
    require 'vendor/autoload.php';

    $user = new User();

    $userData = $user->SelectUserByEmail($email);

    $totp = new Totp();

    if (!$userData) {
        
        $errors[] = "Failed to find user email in database. Please check syntax.";
    } else {

        if (!password_verify($password, $userData["password_hash"])) {
            $errors[] = "Password doesn't match. Please check your syntax.";
        }

        if (!$totp->validateToken($userData["user_secret"], $auth_code)) {
            $errors[] = "2fa failed. Please check your authenticator app again.";
        }
    }

    if (count($errors) <= 0) {
        header("Location: user_space.php");
        die();
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
        <h1>Please, log in</h1>
        <p>To access the <strong>Super great page with super amazing stuff to do&trade;</strong>, please log in.</p>

        <?php if (count($errors) > 0) { ?>
            <div>
                <?php foreach ($errors as $error) { ?>
                    <div class="alert alert-danger">
                        <?= $error ?>
                    </div>
                <?php } ?>
            </div>
        <?php } ?>

        <form method="post" class="form-horizontal">
            <div class="form-group">
                <label class="control-label col-sm-3" for="email">Your email:</label>
                <div class="col-sm-9">
                    <input type="email" class="form-control" name="email" id="email" required value="<?= $email ?>" placeholder="Enter email (Ex John@doe.com)">
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-sm-3" for="password">Your password:</label>
                <div class="col-sm-9">
                    <input type="password" class="form-control" name="password" id="password" required value="<?= $password ?>" placeholder="Enter password (Ex password12345)">
                </div>
            </div>
            <div class="form-group">
                <label class="control-label col-sm-3" for="auth_code">Your authentification code</label>
                <div class="col-sm-9">
                    <input type="number" class="form-control" name="auth_code" id="auth_code" required value="<?= $auth_code ?>" placeholder="Enter authenticator code (Ex 12356)">
                </div>
            </div>
            <div class="form-group">
                <div class="col-sm-offset-2 col-sm-10">
                    <strong><input type="submit" value="login" class="btn btn-default"></strong>
                </div>
            </div>
        </form>
        <p>Reminder, your 2 factor authentication code is in your authenticator app, under twofa_app</p>
        <p> Don't have an account? <a href="signup.php">sign up</a> </p>
    </div>
</body>

</html>