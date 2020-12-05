<?php

date_default_timezone_set("America/Los_Angeles");
header("Access-Control-Allow-Origin: http://localhost:3000");
$offset=0x3800;
$chunk=128*2*4;
$stream = fopen('somedoubts.pcm', 'rb');

while (1) {
    
  echo stream_get_contents($stream, $chunk,$offset);


  $offset+=$chunk;

  while (ob_get_level() > 0) {
    ob_end_flush();
  }
  flush();


  // break the loop if the client aborted the connection (closed the page)
  
  if ( connection_aborted() ) break;
  sleep(128/44100);
}
