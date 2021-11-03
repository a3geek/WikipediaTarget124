class ModelViewer {
    static Loader = ModelViewer.#GetRequest();

    
    static #GetRequest() {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open("GET", "./words_getter.php");
            request.responseType = "json";
            request.send();
            request.onload = () => {
                resolve(request.response);
            };
        });
    }
}
