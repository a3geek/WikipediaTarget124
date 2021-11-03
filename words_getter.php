<?php

require("libs/models.php");

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

$pdo = new PDO("sqlite:wikipedia_targets.sqlite");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

echo json_encode(getAllWordsAndRelations($pdo), JSON_UNESCAPED_UNICODE);

?>
