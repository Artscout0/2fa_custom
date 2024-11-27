<?php

namespace Tomasst\TotpServer\Utils;
use \PDO;

class Utils{
    const USER_NAME = "tribis";
    const USER_PWD = "tomass";
    const DB_HOST = "localhost";
    const DB_NAME = "tribis";
    const DB_CHARSET = "utf8mb4";

    static function connectDatabase(): PDO
    {
        static $pdo = null;

        if ($pdo === null) {
            $dsn = 'mysql:host=' . Utils::DB_HOST . ';dbname=' . Utils::DB_NAME . ';charset=' . Utils::DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, Utils::USER_NAME, Utils::USER_PWD, $options);
        }

        return $pdo;
    }
}