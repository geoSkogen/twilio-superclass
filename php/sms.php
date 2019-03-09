<?php
require_once './vendor/autoload.php';
use Twilio\TwiML\MessagingResponse;
$to_do_list = Array();
$from_num = $_POST['From'];
$from_body = $_POST['Body'];

function add_to_list($arg,$list) {
  $new_list = Array();
  return $new_list;
}
$client_id = "+15033389275";
$add = "add ";
if ($from_num == $client_id) {
  $response = new MessagingResponse();
  $pos = strpos($from_body, $add);
  if ($pos !== false) {
    $response->message(
      "Your message was sent from " . $from_num . "\r\n" .
      " . . . and they said: " . $from_body . "\r\n" .
      " . . . and their paws was " . $pos
    );
  /*
  $from_country = $_POST['FromCountry'];
  $response = new MessagingResponse();
  $response->message(
    "Your message was sent from " . $from_country
  );
  */
    echo $response;
  }
}
