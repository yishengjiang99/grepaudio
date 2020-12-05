<?php
header("Access-Control-Allow-Origin: * ");

$r=$_REQUEST;
$f=isset($r['f']) ? $r['f'] : 440;
$inst= isset($r['inst'])?$r['inst']	:null;
if($r && $inst){
	header("Content-Type: audio/pcm");
}else{
	$format=isset($r['format']) ? $r['format'] : 'wav';  
	$comand=exec("ffmpeg -loglevel panic -f lavfi -i sine=frequency=$f:duration=1 -f $format -",$d,$o);
	header("Content-Type: audio/$format");
	echo implode("",$d);
	
}
