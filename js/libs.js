function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[(keys.length * Math.random()) << 0]];
}

function clamp(val, min, max) {
    return Math.min(Math.max(min, +val), max);
}
