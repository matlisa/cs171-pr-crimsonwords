<?php 

  $host = "localhost";
  $user = "iopsacco_kim";
  $pass = "4434161000";

  $databaseName = "iopsacco_kimstuff";
  $word = $_GET['word'];

  //Connect to mysql database
  include 'DB.php';
  $con = mysql_connect($host,$user,$pass);
  $dbs = mysql_select_db($databaseName, $con);

 //query 
  $q = "SELECT json FROM content_jsons WHERE word=\"$word\"";
  $result = mysql_query("SELECT json FROM content_jsons WHERE word='$word'"); 
  $array = mysql_fetch_row($result);                              

//make json
  echo json_encode($array[0]);

?>