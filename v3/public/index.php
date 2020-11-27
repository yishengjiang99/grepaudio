<html>
<head>
<style><?php echo file_get_contents("style.css")?></style>
</head>
<body>
<?php
exec("ls csv/*.csv",$ob);
forEach($ob as $k=>$v){
        echo "<br><a href='index.php?file=$v' class='midi'>$v</a>";
}
?>


<script type="module">
import {playMidi} from './build/mixer.js';
const outputdiv = document.querySelector("#output");
const report = (str)=>outputdiv.append("<br>"+str);
</script>
<pre id='output'>
<?php
if($_GET['file']){
	$fd=fopen($_GET['file'],'r');
	while($line=fgets($fd)){
		echo $line;	
	}
}?>
</pre>
</body>
</html>