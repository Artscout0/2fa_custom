<?php

namespace Tomasst\TotpServer;

class Totp extends Hotp {
    const DEFAULT_ALGORITHM = 'sha1';
    const DEFAULT_DIGITS = 6;
    const DEFAULT_INTERVAL = 30;
    const DEFAULT_START_TIME = 0;
    const ACCEPTED_PERIODS = 1; // ±n periods

    private $startTime;
    private $timeInterval;

    public function __construct($algo = self::DEFAULT_ALGORITHM, $start = self::DEFAULT_START_TIME, $ti = self::DEFAULT_INTERVAL)
    {
        parent::__construct($algo);
        $this->startTime = $start;
        $this->timeInterval = $ti;
    }

    public function GenerateToken($key, $time = null, $length = self::DEFAULT_DIGITS)
    {
        $key = Base32::decode($key); 

        if (is_null($time)) {
            $time = time(); // current UNIX timestamp
        }

        // Calculate the time-based counter
        $count = floor(($time - $this->startTime) / $this->timeInterval);

        // Generate the OTP based on the HOTP algorithm
        return parent::GenerateToken($key, $count, $length);
    }

    public function validateToken($key, $token, $time = null, $n = self::ACCEPTED_PERIODS, $length = self::DEFAULT_DIGITS) 
    {
        if (is_null($time)) {
            $time = (new \DateTime())->getTimestamp();
        }

        $key = Base32::decode($key);

        for ($i = -$n; $i <= $n; $i++) { 
            
            // Calculate the counter for the current time step
            $count = floor(($time - $this->startTime) / $this->timeInterval) + $i;

            // Generate the valid token for the current time period
            $validToken = parent::GenerateToken($key, $count, $length);

            // If a match is found, return true
            if ($validToken === $token) {
                return true;
            }
        }

        // If no match is found, return false
        return false;
    }
}