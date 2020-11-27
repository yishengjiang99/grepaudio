<?
echo "<html><body>welcome<p>";
exec("ls",$ob);
echo implode("<br>",$ob);
echo "</p></body></html>";
