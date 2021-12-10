const ref = require("../ref");
const dataTypes = ref.data_types;

const collectionName = "users";

module.exports = {
    attributes: {
        "first_name": {
            "type": dataTypes.string.value,
            "allow_null": false,
            "default": "",
        },
        "last_name": {
            "type": dataTypes.string.value,
            "allow_null": true,
            "default": "",
        }
    },
    collectionName
}