const dbConfig = require('../config/mongo.config.json');
const { MongoClient } = require("mongodb");
const copy = require("../utility/copy");
const ref = require("./ref");
const { collections } = require('./collections/index.collection');

const username = process.env.mongoUsername ?? dbConfig.username;
const password = process.env.mongoPassword ?? dbConfig.password;
const dbName = process.env.mongoDb ?? dbConfig.db;
const host = process.env.mongoHost ?? dbConfig.host;
const port = process.env.mongoPort ?? dbConfig.port;

const url = `mongodb://${username}:${password}@${host}:${port}`;

const processes = {
    "insert_one": {
        "process_name": "InsertOne",
        "params_number": 2,
        "process": async (client, collectionName, data) => {
            console.log(require('util').inspect(
                verify(collectionName, data),
                false,
                null,
                true /* enable colors */
            ));
            // await client.db(dbName).collection(collectionName).insert(
            //     data,
            // )
            console.log(data);
        }
    }
};

const startProcess = async (processName, params) => {
    try {
        const selectedProcess = (() => {
            for (const key in processes) {
                if (processes[key].process_name === processName) return processes[key];
            }

            return null;
        })();
        if (selectedProcess === null || !Array.isArray(params)) return;
        if (params.length !== selectedProcess.params_number) return;

        const client = new MongoClient(url);
        await client.connect();
        await selectedProcess.process(client, ...params);
        await client.close();
    } catch (e) {
        console.error(e);
    }
}

const verify = (collectionName, data) => {
    const collection = collections[collectionName] ?? null;
    if (collection === null) return false;

    const valids = [];
    const invalids = [];
    const others = [];

    const attributes = collection.attributes;
    for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            valids.push({
                attribute: key,
                messages: ["attribute is exist"],
            });
        } else {
            if (!attributes[key].allow_null) {
                invalids.push({
                    attribute: key,
                    messages: ["attribute is required"],
                });
            } else {
                others.push({
                    attribute: key,
                    messages: ["value is not provided but it is optional"],
                });
            }
        }
    }

    const filteredValids = [];
    for (let i = 0; i < valids.length; i++) {
        const attributeName = valids[i].attribute;
        const type = attributes[attributeName].type;
        if (ref.data_types[type].verify(data[attributeName])) {
            valids[i].messages.push("value of the attribute is valid");
            filteredValids.push(valids[i]);
        }
        else {
            valids[i].messages.push("value of the attribute is invalid");
            invalids.push(valids[i]);
        }
    }

    return {
        valids: filteredValids,
        invalids,
        others,
    };
}

module.exports = {
    startProcess,
    processes: copy.deepCopyObject(processes),
}