<?


echo file_get_contents("db/midi.csv",'r');
  
//   echo "event: ping\n";
//   $curDate = date(DATE_ISO8601);
//   echo 'data: {"time": "' . $curDate . '"}';
//   echo "\n\n";
  
//   // Send a simple message at random intervals.
  
//   $counter--;
  
//   if (!$counter) {
//     echo 'data: This is a message at time ' . $curDate . "\n\n";
//     $counter = rand(1, 10);
//   }
  
//   ob_end_flush();
//   flush();

//   // Break the loop if the client aborted the connection (closed the page)

//   if ( connection_aborted() ) break;

//   sleep(1);
// }
