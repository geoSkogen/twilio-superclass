<?php
// Required if your environment does not handle autoloading
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/creds.php';

// Use the REST API Client to make requests to the Twilio REST API
use Twilio\Rest\Client;

// Your Account SID and Auth Token from twilio.com/console
$client = new Client($creds[0]['acctSID'], $creds[0]['token']);
$the_time = gettimeofday(true);

// Use the client to do fun stuff like send text messages!
$client->messages->create(
    // the number you'd like to send the message to
    "+15033389275",
    array(
        // A Twilio phone number you purchased at twilio.com/console
        'from' => $creds[0]['num'],
        // the body of the text message you'd like to send
        'body' => 'Greetings! The current time is: ' . $the_time . ' G995VG2AO8I0BF0.'
    )
);
