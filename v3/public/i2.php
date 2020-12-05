<html>
<head>
<style><?php echo file_get_contents("style.css")?></style>
</head>
<body>


<script type='module'>
import {ui} from "./build/Sequence.js";
ui();
debugger;
</script>
<?php
exec("ls csv/*.csv",$ob);
forEach($ob as $k=>$v){
		echo "<br>
		<a target=_blank href='#$v' class='midi'>$v</a>";
}
?>

<pre id='output'>

</pre>
</body>
</html>