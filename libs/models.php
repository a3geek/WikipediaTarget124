<?php

function addPrimaryId($word, $pdo)
{
    $fetched = fetch($pdo, "SELECT * FROM words WHERE word=?", array($word));
    if ($fetched) {
        return $fetched["id"];
    }

    fetch($pdo, "INSERT INTO words(word) VALUES(?)", array($word));
    return $pdo->lastInsertId();
}

function addRelation($wordId1, $wordId2, $pdo)
{
    $fetched = fetch(
        $pdo,
        "SELECT * FROM relations WHERE (word_id1=? AND word_id2=?) OR (word_id1=? AND word_id2=?)",
        array($wordId1, $wordId2, $wordId2, $wordId1)
    );
    if ($fetched) {
        return $fetched["id"];
    }

    fetch(
        $pdo,
        "INSERT INTO relations(word_id1, word_id2) VALUES(?, ?)",
        array($wordId1, $wordId2)
    );
    return $pdo->lastInsertId();
}

function getRelations($wordId, $pdo)
{
    $result = [];
    $count = 0;

    $fetched = fetchAll($pdo, "SELECT * FROM relations WHERE word_id1=?", array($wordId));
    for ($i = 0; $i < count($fetched); $i++) {
        $result[$count++] = $fetched[$i]["word_id2"];
    }

    $fetched = fetchAll($pdo, "SELECT * FROM relations WHERE word_id2=?", array($wordId));
    for ($i = 0; $i < count($fetched); $i++) {
        $result[$count++] = $fetched[$i]["word_id1"];
    }

    return $result;
}

function getAllWordsAndRelations($pdo)
{
    $result = [];
    $fetched = fetchAll($pdo, "SELECT * FROM words", []);

    for ($i = 0; $i < count($fetched); $i++) {
        $v = $fetched[$i];

        $result[$v["id"]] = [
            "word" => $v["word"],
            "relations" => getRelations($v["id"], $pdo)
        ];
    }

    return $result;
}

function fetch($pdo, $sql, $array)
{
    $st = $pdo->prepare($sql);
    $st->execute($array);
    return $st->fetch();
}

function fetchAll($pdo, $sql, $array)
{
    $st = $pdo->prepare($sql);
    $st->execute($array);
    return $st->fetchAll();
}
