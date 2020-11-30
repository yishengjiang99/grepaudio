<?php
header("Access-Control-Allow-Origin: http://localhost:3001");

$r=$_REQUEST;
$f=isset($r['f']) ? $r['f'] : 440;
$format=isset($r['format']) ? $r['format'] : 'wav';  
$comand=exec("ffmpeg -loglevel panic -f lavfi -i sine=frequency=$f:duration=1 -f $format -",$d,$o);
header("Content-Type: audio/$format");
echo implode("",$d);
