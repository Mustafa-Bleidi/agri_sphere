<?php

namespace App\Exceptions;

use RuntimeException;

// Thrown when a city name can't be resolved to a location. Unlike other
// weather/network failures, this message is safe to show to the user as-is
// since it's actionable (try a different city name).
class LocationNotFoundException extends RuntimeException
{
}
