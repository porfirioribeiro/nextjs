<?php
$files=array(
	"Next",
	"Protos",
	"Color",
	"Thread",
	"Enumerable",
	"Eventable",
	"Element",
	"Animation",
	"Property"
);
if (!isset($_GET["debug"])){
	include "jsmin.php";
}
ob_start ("ob_gzhandler");
if($ext=="js") $ext="javascript";
header("Content-type: text/javascript; charset: UTF-8");
header("Content-Encoding: gzip,deflate");
header("Expires: ".gmdate("D, d M Y H:i:s", time() + (24 * 60 * 60 * 60)) . " GMT");//adiciona 1 dia ao tempo de expiração
header( "ETag: ".dechex( $file_last_modified ) );
header( "Cache-Control: must-revalidate, proxy-revalidate, max-age=" . $max_age . ", s-maxage=" . $max_age );

foreach ($files as $file){
	$file.=".js";
	$f=file_get_contents($file);
	if (isset($_GET["debug"])){
		echo "//-START-".$file."-\n";
		echo $f;
		echo "//-END-".$file."-\n";
	}else{
		echo JSMin::minify($f);
	}
}
?>
