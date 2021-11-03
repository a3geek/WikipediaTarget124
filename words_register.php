<?php
require("libs/models.php");

$isset = isset($_POST["master"]) && isset($_POST["words"]);
if (!$isset) {
    $result = false;
} else {
    try {
        $pdo = new PDO("sqlite:wikipedia_targets.sqlite");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

        $master = $_POST["master"];
        $words = explode(",", $_POST["words"]);

        $masterId = addPrimaryId($master, $pdo);
        for ($i = 0; $i < count($words); $i++) {
            if ($words[$i] == "") {
                continue;
            }

            $wordId = addPrimaryId($words[$i], $pdo);
            if ($masterId == $wordId) {
                continue;
            }

            addRelation($masterId, $wordId, $pdo);
        }

        $result = true;
    } catch (Exception $ex) {
        $result = false;
    }
}
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Wikipediaターゲット124万</title>
    <link rel="stylesheet" href="./css/index.css">
</head>

<body>
    <div id="main">
        <h2><?php print $result === true ? "保存に成功しました"  : "保存に失敗しました"; ?></h2>

        <p>
            <a href="./index.html">トップに戻る</a> | <a href="./words_viewer.html">保存された単語を確認する</a>
        </p>
    </div>
</body>

</html>