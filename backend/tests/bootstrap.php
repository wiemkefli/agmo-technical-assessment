<?php

/**
 * PHPUnit bootstrap.
 *
 * Some Windows environments can report `vendor/autoload.php` as not readable even though it can be required.
 * We keep the bootstrap readable and require Composer's autoloader from here.
 */

require __DIR__ . '/../vendor/autoload.php';

