function deepCopyArray(arr) {
    if (typeof arr == "object") {
        if (Array.isArray(arr)) {
            const out = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var item = arr[i];
                if (typeof item == 'object') {
                    var obj = {};
                    for (var k in item) {
                        obj[k] = Array.isArray(item[k]) ? deepCopyArray(item[k]) : typeof item[k] == 'object' ? deepCopyObject(item[k]) : item[k];
                    }
                    out.push(obj);
                }
                else {
                    out.push(item);
                }
            }
            return out;
        }
        return deepCopyObject(arr);
    }
    
    return arr;
}

function deepCopyObject(object) {
    if (typeof object == "object") {
        if (Array.isArray(object)) return deepCopyArray(object);
        const cloned = {};
        for (var k in object) {
            cloned[k] = Array.isArray(object[k]) ? deepCopyArray(object[k]) : typeof object[k] == 'object' ? deepCopyObject(object[k]) : object[k];
        }
        return cloned;
    }

    return object;

}

module.exports = {
    deepCopyArray,
    deepCopyObject,
}