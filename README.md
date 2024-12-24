# 2fa_custom

A custom implementation of TOTP based on RFC 6238

## To Install

in a terminal (tested using powershell) go into twofa_app and run cordova `platform add android`, followed by `cordova build`.

This should give you a path to an APK, which you can transfer to your phone, and then install by double clicking on it and following the prompts.

To test this, put the contents of the server folder on a server (tested using WSL and an apache2 server).
