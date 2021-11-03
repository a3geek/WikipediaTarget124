class WordPlaneCreator {
    #material = null;
    #geometry = null;
    #clock = new THREE.Clock(false);
    #fogDistance = 10.0;
    #fogOffset = 2.5;

    constructor(shaders, width, height) {
        this.#material = new THREE.RawShaderMaterial({
            vertexShader: shaders[0],
            fragmentShader: shaders[1],
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
                map: { value: null },
                time: { value: 1.0 },
                offset: { value: 0 },
                wordColor: { value: new THREE.Color(0x000000) },
                eyePosition: { value: new THREE.Vector3(0, 0, 0) },
                fogDistance: { value: 10.0 },
                fogOffset: { value: 2.5 },
                alpha: { value: 1.0 },
                select: { value: 0 },
                aspect: { value: width / height }
            }
        });
        this.#geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);

        dom.params.fogDistance.oninput = () => this.#onParamsChanged(this);
        dom.params.fogOffset.oninput = () => this.#onParamsChanged(this);
        this.#onParamsChanged(this);
        this.#clock.start();
    }

    #onParamsChanged(self) {
        self.#fogDistance = dom.params.fogDistance.value;
        self.#fogOffset = dom.params.fogOffset.value;
    }

    get(word) {
        const texture = new THREE.CanvasTexture(
            this.#createWordTexture(256, 256 / 2, word, 75, 250, 10)
        );
        const mesh = new THREE.Mesh(this.#geometry, this.#material);
        mesh.name = word;

        const offset = random(0.0, 2.0 * Math.PI);
        const wordColor = new THREE.Color(Math.random() * 0xffffff);
        let alpha = 1.0;

        mesh.onBeforeRender = () => {
            alpha = Searcher.Instance.words[word] !== undefined || Searcher.Instance.word === ""
                ? clamp((alpha >= 1.0 ? 1.0 : 0.0) + Searcher.Instance.timer, 0.0, 1.0)
                : (alpha <= 0.0 ? 0.0 : 1.0) * clamp(1.0 - Searcher.Instance.timer, 0.0, 1.0);

            const uniforms = mesh.material.uniforms;
            uniforms.map.value = texture;
            uniforms.time.value = this.#clock.getElapsedTime();
            uniforms.offset.value = offset;
            uniforms.wordColor.value = wordColor;
            uniforms.eyePosition.value = Viewer.Instance.camera.position;
            uniforms.fogDistance.value = this.#fogDistance;
            uniforms.fogOffset.value = this.#fogOffset;
            uniforms.alpha.value = alpha;
            uniforms.select.value = Selector.Instance.intersected === mesh ? 1 : 0;
            mesh.material.uniformsNeedUpdate = true;
        };

        return [mesh, wordColor];
    }

    #createWordTexture(width, height, text, fontSize, maxWidth, minFontSize) {
        const getResizedFontSize = function () {
            ctx.font = `${fontSize}px serif`;
            let width = ctx.measureText(text).width;
            if (width <= maxWidth) {
                return fontSize;
            }

            let decrement = 1;
            let newWidth = width;
            let newFontSize = fontSize;
            while (width > maxWidth) {
                newFontSize -= decrement;
                if (newFontSize < minFontSize) {
                    return minFontSize;
                }

                ctx.font = `${newFontSize}px serif`;
                newWidth = ctx.measureText(text).width;
                if (newWidth < maxWidth && decrement === 1) {
                    decrement = 0.1;
                    newFontSize += 1;
                }
                else {
                    width = newWidth;
                }
            }

            return newFontSize;
        };

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.canvas.width = width;
        ctx.canvas.height = height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.font = `${getResizedFontSize()}px serif`;
        ctx.fillStyle = '#ffffffff';
        ctx.fillText(text, (width - ctx.measureText(text).width) * 0.5, (height + ctx.measureText(text).actualBoundingBoxAscent) * 0.5);

        return canvas;
    }
}
