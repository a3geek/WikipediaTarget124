const dom = {
    main: document.getElementById("main"),
    loader: document.getElementById("loader"),
    canvas: document.getElementById("canvas"),
    wikipediaWordsCount: document.getElementById("wikipedia-words-count"),
    currentWordsCount: document.getElementById("current-words-count"),
    currentWordRate: document.getElementById("current-word-rate"),
    params: {
        fogDistance: document.getElementById("fogDistance"),
        fogOffset: document.getElementById("fogOffset"),
        searchWord: document.getElementById("searchWord"),
        searchWordButton: document.getElementById("searchWordButton")
    }
}
const consts = {
    wikipediaWordsCount: 1246501
};
const formatter = new Intl.NumberFormat('ja-JP');

let viewer = null;
let searcher = null;
let selector = null;

function Search(word) {
    searcher.search(word);
}

function Initialize() {
    dom.wikipediaWordsCount.textContent = formatter.format(consts.wikipediaWordsCount);

    Promise.all([ModelViewer.Loader, Viewer.Loader])
        .then(([json, shaders]) => {
            viewer = new Viewer(json, shaders);
            searcher = new Searcher(viewer);
            selector = new Selector(viewer);

            dom.loader.style.display = "none";
            dom.main.style.display = "block";

            const keys = Object.keys(json);
            dom.currentWordsCount.textContent = formatter.format(keys.length);
            dom.currentWordRate.textContent = (keys.length / consts.wikipediaWordsCount).toFixed(10);
            dom.params.searchWordButton.onclick = () => {
                Search(dom.params.searchWord.value);
            }

            viewer.rendering();
            animation();
        });
}

function animation() {
    searcher.update();
    selector.update();

    viewer.rendering();
    window.requestAnimationFrame(animation);
}

Initialize();
