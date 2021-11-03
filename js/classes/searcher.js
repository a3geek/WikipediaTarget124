class Searcher {
    static Instance = null;

    word = "";
    words = {};
    timer = 0.0;
    isAnimating = false;

    #viewer = viewer;
    #clock = new THREE.Clock(false);
    #targets = [];


    constructor(viewer) {
        Searcher.Instance = this;
        this.#viewer = viewer;
    }

    search(word) {
        if (this.isAnimating === true || this.word === word) {
            return;
        }

        this.#initialize();

        if (word === "") {
            this.word = word;
            this.isAnimating = true;
            this.#clock.start();

            return;
        }

        const indexs = this.#viewer.getWordPlaneIndexs(word);
        if (indexs == null) {
            return;
        }

        this.word = word;
        this.isAnimating = true;

        const wordPlane = this.#viewer.getWordPlane(indexs);
        const closeWords = this.getCloseWordPlanes(indexs, wordPlane.relations.length);

        const relations = Array.from(wordPlane.relations);
        const keys = Object.keys(closeWords);

        this.words[word] = wordPlane;

        for (let i = 0; i < keys.length; i++) {
            // 最寄り単語と関連単語が同じ場合は、移動しない.
            const key = keys[i];
            const idx = wordPlane.relationKeys[key];
            if (idx !== undefined) {
                this.words[key] = closeWords[key];

                keys.splice(i, 1);
                relations[idx] = null;
                i--;
            }
        }

        let key = undefined;
        while ((key = keys.shift()) !== undefined) {
            let relation = null;
            while ((relation = relations.shift()) == null) {
            }

            const origin = this.#viewer.getWordPlane(
                this.#viewer.getWordPlaneIndexs(relation)
            );

            const close = closeWords[key];
            this.words[relation] = key;
            this.#viewer.switchWord(origin, close);
            this.#addTargets(origin, close);
        }

        this.#clock.start();
    }

    update() {
        if (this.isAnimating == false) {
            return;
        }

        this.timer += this.#clock.getDelta();
        for (let i = 0; i < this.#targets.length; i++) {
            const t = this.#targets[i];

            if (this.timer >= 1.0) {
                t.origin.position.copy(t.closerPosition);
                t.closer.position.copy(t.originPosition);
            }
            else {
                t.origin.position.lerpVectors(t.originPosition, t.closerPosition, this.timer);
                t.closer.position.lerpVectors(t.closerPosition, t.originPosition, this.timer);
            }

            t.origin.update();
            t.closer.update();
        }

        if (this.timer >= 1.0) {
            this.timer = 1.0;
            this.isAnimating = false;
        }
    }

    getCloseWordPlanes(indexs, num) {
        const words = {};
        const searchCandidates = [];
        const searched = [];

        let depthCount = 0;
        let depth = indexs.depthIndex;
        let column = indexs.columnIndex;
        let row = indexs.rowIndex;
        let counter = 0;

        const depthMax = this.#viewer.words.length;
        const depthDir = depth < depthMax / 2 ? 1 : -1;
        this.#push(searched, depth, column, row, 1);

        while (depthCount < this.#viewer.words.length) {
            do {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (this.#get(searched, depth, column + i, row + j) === 1) {
                            continue;
                        }

                        const closeWord = this.#get(this.#viewer.words, depth, column + i, row + j);
                        if (closeWord === undefined) {
                            continue;
                        }

                        words[closeWord.word] = closeWord;

                        searchCandidates.push({
                            column: column + i,
                            row: row + j
                        });

                        this.#push(searched, depth, column + i, row + j, 1);

                        counter++;
                        if (counter >= num) {
                            return words;
                        }
                    }
                }

                if (searchCandidates.length > 0) {
                    const next = searchCandidates.shift();
                    column = next.column;
                    row = next.row;
                }
            }
            while (searchCandidates.length > 0);

            depth += depthDir;
            depth = depth < 0 ? depthMax - 1 : (depth >= depthMax ? 0 : depth);
            depthCount++;
        }

        return words;
    }

    #push(arr, key1, key2, key3, val) {
        if (arr[key1] === undefined) {
            arr[key1] = [];
        }
        if (arr[key1][key2] === undefined) {
            arr[key1][key2] = [];
        }

        arr[key1][key2][key3] = val;
    }

    #get(arr, key1, key2, key3) {
        return (arr[key1] !== undefined && arr[key1][key2] !== undefined)
            ? arr[key1][key2][key3]
            : undefined;
    }

    #addTargets(origin, closer) {
        this.#targets.push({
            origin: origin,
            closer: closer,
            originPosition: origin.position.clone(),
            closerPosition: closer.position.clone()
        });
    }

    #initialize() {
        this.words = {};
        this.word = "";
        this.isAnimating = false;
        this.timer = 0.0;
        this.#targets = [];
        this.#clock.stop();
    }
}
