const isUndefined = (value) => typeof value === "undefined";
const isObject = (value) => (!isUndefined(value) && typeof value === "object");
const isArray = (value) => (!isUndefined(value) && typeof value === "object" && Array.isArray(value));

module.exports = {
    "data_types": {
        "string": {
            "value": "string",
            "rules": {},
            "verify": (value) => typeof value === "string",
        },
        "integer": {
            "value": "integer",
            "rules": {
                "format": ["32-bit signed integer", "64-bit signed integer"],
            },
            "verify": (value) => {
                if (typeof value !== "number" || typeof value !== "string") return false;
                let x;
                return isNaN(value) ? false : (x = parseFloat(value), (0 | x) === x);
            }
        },
        "double": {
            "value": "double",
            "rules": {},
            "verify": (value) => {
                try { return (typeof value === "number" || typeof value === "string") ? (isNaN(value) ? false : (parseFloat(value), true)) : false; }
                catch (_) { return false; }
            }
        },
        "boolean": {
            "value": "boolean",
            "rules": {},
            "verify": (value) => {
                return typeof value === "boolean";
            }
        },
        "null": {
            "value": "null",
            "rules": {},
            "verify": (value) => value === null,
        },
        "array": {
            "value": "array",
            "rules": {},
            "verify": (value) => isArray(value),
        },
        "object": {
            "value": "object",
            "rules": {},
            "verify": (value) => (isObject(value) && !Array.isArray(value)),
        },
        "undefined": {
            "value": "undefined",
            "rules": {},
            "verify": (value) => isUndefined(value),
        },
        "binary_data": {
            "value": "binary_data",
            "rules": {},
            "verify": (value) => typeof value === "string" ? (new RegExp('^[0-1]+$').test(value)) : false,
        },
        "instance_of_mongo_client": {
            "value": "instance_of_mongo_client",
            "rules": {},
            "verify": (value) => {
                const { MongoClient } = require("mongodb");
                return valus instanceof MongoClient;
            }
        }
    },
};