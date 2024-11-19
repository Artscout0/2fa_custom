<?php

namespace Tomasst\TotpServer;

class Totp extends Hotp {
    private $startTime;
    private $timeInterval;

    public function __construct($algo = 'sha1', $start = 0, $ti = 30)
    {
        parent::__construct($algo);
        $this->startTime = $start;
        $this->timeInterval = $ti;
    }

    public function GenerateToken($key, $time = null, $length = 6)
    {
        // if necessary, pad the key.
        if ($this->algorythm === 'sha256') { 
            $key = $key . substr($key, 0, 12);
        } elseif ($this->algorythm === 'sha512') {
            $key = $key . $key . $key . substr($key, 0, 4);
        }

        // if no timestamp provided, get the current timestamp. Also happens to be the default case.
        if (is_null($time)) {
            $time = (new \DateTime())->getTimestamp();
        }

        // gets the count
        $now = $time - $this->startTime;
        $count = floor($now / $this->timeInterval);

        // and, based on all of the currently available data, generate a regular HOTP token.
        return parent::GenerateToken($key, $count, $length);
    }
}