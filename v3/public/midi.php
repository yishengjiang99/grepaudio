<?php
$file = isset($_GET['file']) && $_GET['file'] || "./song.mid";
$fd=fopen('/Users/yisheng/grepawk3/grepaudio/v3/public/song.mid',"rb");

$offset=0;
$str='';
$str.=chr(fgetc($fd));
$str.=chr(fgetc($fd));
$str.=chr(fgetc($fd));
$str.=chr(fgetc($fd));

echo fgetc($fd);

function getString($n){
	global $fd, $offset;
	$str='';
	while($n--){
		$str.=chr(fgetc($fd));
	}
	return $str;
}