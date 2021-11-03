$(function () {
    const searchForm = $('#search-form'); 
    const searchWord = $('#search-word-input');
    const searchedWords = $('#searched-words');
    const loader = $("#loader")
    let isSearching = false;

    function searchSpecifiedWord(word) {
        if (isSearching == true || word === "") {
            return;
        }
        isSearching = true;

        loader.css({ visibility: "visible" });
        searchWord.val(word);

        requestToWikipedia(word, function (results) {
            let words = "";
            for (let i = 0; i < results.length; i++) {
                const title = results[i]["title"];
                words += title + ",";
            }

            searchedWords.val(words);

            // isSearching = false;
            // loader.css({ visibility: "hidden" });

            searchForm.submit();
        });
    }

    $("#search-button").on("click", function () {
        searchSpecifiedWord(searchWord.val());
    });
});

function requestToWikipedia(word, callback) {
    const data = {
        format: "json",
        action: "query",
        prop: "links",
        plnamespace: "0",
        pllimit: "100",
        titles: word,
    }
    let results = [];

    function request(plcontinue) {
        if (plcontinue !== "") {
            data.plcontinue = plcontinue;
        }
        $.ajax({
            url: 'https://ja.wikipedia.org/w/api.php',
            data: data,
            type: 'GET',
            dataType: 'jsonp',
            timeout: 1000,
            success: function (json) {
                try {
                    const pages = json["query"]["pages"];
                    const links = pages[Object.keys(pages)[0]]["links"];
                    if (links !== undefined) {
                        results = results.concat(links);
                    }
                }
                catch {
                    alert("パースエラーです。");
                    return;
                }

                if (json["continue"] === undefined || json["batchcomplete"] !== undefined) {
                    callback(results);
                    return;
                }

                request(json["continue"]["plcontinue"]);
            },
            error: function () {
                alert("通信エラーです。");
            }
        });
    };
    request("");
}
