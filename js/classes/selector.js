class Selector {
    static Instance = null;
    static DelayTime = 0.5;

    intersected = null;

    #viewer = null;
    #raycaster = null;
    #mouse = new THREE.Vector2();
    #isDelaying = false;
    #clock = new THREE.Clock();


    constructor(viewer) {
        Selector.Instance = this;

        this.#viewer = viewer;
        this.#raycaster = new THREE.Raycaster();

        dom.canvas.addEventListener('mousemove', (event) => {
            const rect = dom.canvas.getBoundingClientRect();
            this.#mouse.x = (event.clientX - rect.left) * 2 / dom.canvas.width - 1;
            this.#mouse.y = - (event.clientY - rect.top) * 2 / dom.canvas.height + 1;
        });

        dom.canvas.addEventListener('click', (event) => {
            if (!this.#isEnable()) {
                return;
            }

            dom.params.searchWord.value = this.intersected == null ? "" : this.intersected.name;
            Search(dom.params.searchWord.value);
        });
    }

    update() {
        if (Searcher.Instance.isAnimating == true) {
            this.intersected = null;
            return;
        }
        if (dom.canvas !== document.activeElement) {
            this.#isDelaying = true;
            return;
        }
        else if (this.#isDelaying === true) {
            this.#isDelaying = false;
            this.#clock.start();
        }

        if (!this.#isEnable()) {
            return;
        }
        this.#clock.stop();

        this.#raycaster.setFromCamera(this.#mouse, this.#viewer.camera);
        const intersects = this.#raycaster.intersectObjects(this.#viewer.scene.children);

        if (
            intersects.length > 0 && intersects[0].distance <= WordPlane.Depth &&
            (Searcher.Instance.words[intersects[0].object.name] !== undefined || Searcher.Instance.word === "")
        ) {
            this.intersected = intersects[0].object;
        }
        else {
            this.intersected = null;
        }
    }

    #isEnable() {
        return !(this.#clock.running === true && this.#clock.getElapsedTime() < Selector.DelayTime);
    }
}
