<?php
header("Access-Control-Allow-Origin: * ");

header("Content-Type: text/event-stream");
$r = $_GET;
$tm = isset($r['t'] )  ? explode("-",$_GET['t']) : [0,10000];
$mm=intval($tm[1]);

if($_GET['file']){
	$fd=fopen($_GET['file'],'r');
 	$tm =isset( $_GET->t) && explode("-",$_GET['t']);

	$t0 = microtime(true);

	while($line=fgets($fd)){
		usleep(40)	;
		$line = trim($line);
		$t = explode(",",$line);
		$time = $t[4];
		$elapsed = microtime(true) - $t0;
		if($elapsed > $tm[0]) break;
		if(!$t0) $t0=microtime(true);

		while($elapsed<$time){
			usleep(10);
			$elapsed = microtime(true) - $t0;
		}
		echo $line;
		echo "event: note\n";
		echo "data: ".json_encode($t)."\n\n";
		reallyflush();
	}
}
function reallyflush(){
	while (ob_get_level() > 0) {
		ob_end_flush();
	  }
	  flush();
}
