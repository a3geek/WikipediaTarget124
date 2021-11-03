class WordPlane {
    static Width = 3;
    static Height = 1.75;
    static Depth = 7.5;

    mesh = null;
    word = null;
    position = null;
    color = null;
    relations = [];
    relationKeys = {};


    constructor(json, key, depthIndex, columnIndex, rowIndex, rowCount, depthCount) {
        this.word = json[key]["word"];
        const [mesh, color] = Viewer.WordPlaneCreator.get(this.word);
        this.mesh = mesh;
        this.color = color;

        const w = WordPlane.Width;
        const h = WordPlane.Height;
        const d = WordPlane.Depth;

        const x = w * columnIndex - w * rowCount * 0.5 + w * 0.5;
        const y = h * rowIndex - h * rowCount * 0.5 + h * 0.5;
        const z = -d * depthIndex + depthCount * d * 0.5 - d * 0.5;

        this.position = new THREE.Vector3(x, y, z);
        this.mesh.position.copy(this.position);

        const relations = json[key]["relations"];
        for (let i = 0; i < relations.length; i++) {
            const w = json[relations[i]]["word"];

            this.relations[i] = w;
            this.relationKeys[w] = i;
        }
    }

    update() {
        this.mesh.position.copy(this.position);
    }
}
