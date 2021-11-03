class Viewer {
    static Loader = Promise.all([Viewer.#LoadFile("./js/shaders/vertex.glsl"), Viewer.#LoadFile("./js/shaders/fragment.glsl")]);
    static WordPlaneCreator = null;
    static Instance = null;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, dom.canvas.width / dom.canvas.height, 0.01, 100);
    words = [];

    #renderer = new THREE.WebGLRenderer({
        canvas: dom.canvas,
        antialias: true,
        alpha: true,
        devicePixelRatio: window.devicePixelRatio
    });
    #controls = new THREE.FirstPersonControls(this.camera, this.#renderer.domElement);
    #wordDictionary = {};
    #clock = new THREE.Clock(false);
    #rowCount = 0;


    constructor(json, shaders) {
        Viewer.Instance = this;

        this.#renderer.setSize(dom.canvas.width, dom.canvas.height);
        this.scene.background = new THREE.Color(0xffffff);

        this.camera.position.set(0.0, 0.0, 15.0);
        this.camera.lookAt(0.0, 0.0, 0.0);
        this.scene.add(this.camera);

        this.#controls.lookSpeed = 0.1;
        this.#controls.movementSpeed = 10.0;
        this.#controls.noFly = true;
        this.#controls.lookVertical = false;
        this.#controls.activeLook = false;

        Viewer.WordPlaneCreator = new WordPlaneCreator(shaders, 2.5, 2.5 / 2);

        const keys = Object.keys(json);
        this.#rowCount = Math.floor(Math.pow(keys.length, 1.0 / 2.5));
        const depthCount = Math.ceil(keys.length / (this.#rowCount * this.#rowCount));

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            const depthIndex = Math.floor(i / (this.#rowCount * this.#rowCount));
            const columnIndex = Math.floor(i / this.#rowCount) - this.#rowCount * depthIndex;
            const rowIndex = i - this.#rowCount * (columnIndex + this.#rowCount * depthIndex);

            const wordPlane = new WordPlane(
                json, key, depthIndex, columnIndex, rowIndex, this.#rowCount, depthCount
            );
            this.scene.add(wordPlane.mesh);

            if (this.words[depthIndex] === undefined) {
                this.words[depthIndex] = [];
            }
            if (this.words[depthIndex][columnIndex] === undefined) {
                this.words[depthIndex][columnIndex] = [];
            }

            this.words[depthIndex][columnIndex][rowIndex] = wordPlane;
            this.#wordDictionary[wordPlane.word] = {
                depthIndex: depthIndex,
                columnIndex: columnIndex,
                rowIndex: rowIndex
            };
        }

        this.#clock.start();
    }

    rendering() {
        this.#controls.enabled = dom.canvas === document.activeElement;

        this.#controls.update(this.#clock.getDelta());
        this.#renderer.render(this.scene, this.camera);
    }

    switchWord(wordPlane1, wordPlane2) {
        const idx1 = this.getWordPlaneIndexs(wordPlane1.word);
        const idx2 = this.getWordPlaneIndexs(wordPlane2.word);
        this.#wordDictionary[wordPlane1.word] = idx2;
        this.#wordDictionary[wordPlane2.word] = idx1;

        this.words[idx1.depthIndex][idx1.columnIndex][idx1.rowIndex] = wordPlane2;
        this.words[idx2.depthIndex][idx2.columnIndex][idx2.rowIndex] = wordPlane1;
    }

    getWordPlaneIndexs(word) {
        const indexs = this.#wordDictionary[word];
        return (indexs === undefined || indexs == null)
            ? null
            : indexs;
    }

    getWordPlane(indexs) {
        return this.words[indexs.depthIndex][indexs.columnIndex][indexs.rowIndex];
    }

    static #LoadFile(filename) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.FileLoader();
            loader.load(filename, (data) => {
                resolve(data);
            });
        });
    }
}
