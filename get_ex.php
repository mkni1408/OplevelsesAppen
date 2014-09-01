<?php
header('Access-Control-Request-Headers: X-Requested-With, accept, content-type');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Origin: www.michaelkvistnielsen.dk/');

$host = "db.michaelkvistnielsen.dk";
$mysql_user = "web679572";
$mysql_password = "Abcd1234";
$database = "web679572";
$longitude = $_GET['longitude'];
$latitude = $_GET['latitude'];
$kilometers = $_GET['kilometers'];

$connection = mysql_connect($host, $mysql_user,$mysql_password);
if (!$connection) {die('Could not connect: ' . mysql_error());}
mysql_select_db($database, $connection);

//SQL query:
//FROM http://spinczyk.net/blog/2009/10/04/radius-search-with-google-maps-and-mysql/
//if the url params was empty
if($_GET["latitude"] === "" || $_GET["longitude"] === "" || $_GET["kilometers"] === "")
{
}
else
{
$query = "SELECT * , ACOS( SIN( RADIANS(  `lat` ) ) * SIN( RADIANS( $latitude ) ) + COS( RADIANS(  `lat` ) ) * COS( RADIANS( $latitude ) ) * COS( RADIANS(  `long` ) - RADIANS( $longitude ) ) ) *6380 AS  `distance`
FROM  `experience`
WHERE ACOS( SIN( RADIANS(  `lat` ) ) * SIN( RADIANS( $latitude ) ) + COS( RADIANS(  `lat` ) ) * COS( RADIANS( $latitude ) ) * COS( RADIANS(  `long` ) - RADIANS( $longitude ) ) ) *6380 <$kilometers
ORDER BY  `distance`";

//set character set
$in = mysql_query('SET CHARACTER SET utf8')or die(mysql_error($connection));
//execute query
$out = mysql_query($query, $connection) or die(mysql_error($connection));

$jsonData = array();
while ($array = mysql_fetch_row($out)) {
    $jsonData[] = $array;
}

//echo the data as json
echo json_encode($jsonData);
}


mysql_close($connection);

?>