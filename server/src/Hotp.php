<?php

namespace Tomasst\TotpServer;

class Hotp
{

    protected $algorythm;

    public function __construct($algo = 'sha1')
    {
        $this->algorythm = $algo;
    }

    // in case it is more than 1 byte long, pack the counter
    public function packCounter($counter)
    {
        $cur_counter = array(0, 0, 0, 0, 0, 0, 0, 0);

        for ($i = 7; $i >= 0; $i--) {
            $cur_counter[$i] = pack('C*', $counter);
            $counter = $counter >> 8; // bitshift the counter by 8
        }

        $bin_counter = implode($cur_counter);

        if (strlen($bin_counter) < 8) {
            $bin_counter = str_repeat(chr(0), 8 - strlen($bin_counter)) . $bin_counter; // repea the 0th charcter until all the 8ts are filled
        }

        return $bin_counter;
    }

    private function genHTOPValue($hash, $length)
    {
        $hmac_res = [];

        foreach (str_split($hash, 2) as $hex) {
            $hmac_res[] = hexdec($hex);
        }

        $offset = (int)$hmac_res[count($hmac_res) - 1] & 0xf; // bit magic screwery

        // I sure wonder which RFC I got this code from...
        $code = (int)($hmac_res[$offset] & 0x7f) << 24
            | ($hmac_res[$offset + 1] & 0xff) << 16
            | ($hmac_res[$offset + 2] & 0xff) << 8
            | ($hmac_res[$offset + 3] & 0xff);

        return $code % pow(10, $length);
    }

    public function generateToken($key, $count = 0, $length = 6)
    {
        $count = $this->packCounter($count);
        $hash = hash_hmac($this->algorythm, $count, $key);
        $code = $this->genHTOPValue($hash, $length);

        $code = str_pad($code, $length, "0", STR_PAD_LEFT);
        $code = substr($code, (-1 * $length));

        return $code;
    }

    public static function GenerateSecret($length = 16)
    {

        if ($length % 8 != 0) {
            throw new \Exception("Length must be a multiple of 8");
        }

        $secret = openssl_random_pseudo_bytes($length, $strong);
        if (!$strong) {
            throw new \Exception("Random string generation was not strong");
        }

        return Base32::encode($secret);
    }
}
