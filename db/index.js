const dbConfig = require('../config/mongo.config.json');
const { MongoClient } = require("mongodb");
const copy = require("../utility/copy");
const ref = require("./ref");
const { collections } = require('./collections');
const dataTypeValidator = require("../utility/dataTypeValidator");

const username = process.env.mongoUsername ?? dbConfig.username;
const password = process.env.mongoPassword ?? dbConfig.password;
const dbName = process.env.mongoDb ?? dbConfig.db;
const host = process.env.mongoHost ?? dbConfig.host;
const port = process.env.mongoPort ?? dbConfig.port;

const url = `mongodb://${username}:${password}@${host}:${port}`;
const processParams = {
    "collectionName": {
        "type": dataTypeValidator.data_types.string.value,
        "description": "The name of the collection",
        "value": null,
        "is_required": true,
    },
    "data": {
        "type": dataTypeValidator.data_types.object.value,
        "description": "The data to be saved as the document",
        "value": null,
        "is_required": true,
    },
    "client": {
        "type": dataTypeValidator.data_types.instance_of_mongo_client.value,
        "description": "client is instance of MongoClient",
        "value": null,
        "is_required": false,
    },
};

const processes = {
    "insert_one": {
        "process": async (processParams) => {
            return await processParams.client.value.db(dbName).collection(processParams.collectionName.value).insertOne(processParams.data.value,).then(_ => true).catch(_ => false);
        }
    },
};

const verify = (collectionName, data) => {
    const collection = collections[collectionName] ?? null;
    if (collection === null) return false;

    const valids = [];
    const invalids = [];
    const others = [];
    const processedData = {};

    const attributes = collection.attributes;
    for (const key in attributes) {
        processedData[key] = attributes[key].default;

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
            processedData[attributeName] = data[attributeName];
            valids[i].messages.push("value of the attribute is valid");
            filteredValids.push(valids[i]);
        }
        else {
            valids[i].messages.push("value of the attribute is invalid");
            invalids.push(valids[i]);
        }
    }

    return {
        isSuccess: invalids.length === 0,
        processedData,
        valids: filteredValids,
        invalids,
        others,
    };
}

module.exports = {
    sync: async (force) => {
        let status = false;
        try {
            const client = new MongoClient(url);

            await client.connect();
            const database = await client.db(dbName);

            if (force) await database.dropDatabase();

            await client.close();
            status = true;
        }
        catch (e) {
            status = false;
        }
        finally {
            return status;
        }
    },
    startProcess: async (processName, params) => {
        let isSuccess = false;

        try {
            const selectedProcess = Object.prototype.hasOwnProperty.call(processes, processName) ? processes[processName] : null;
            if (dataTypeValidator.data_types.null.verify(selectedProcess) || !dataTypeValidator.data_types.object.verify(params)) return;
            if (Object.keys(params).length === 0) return;

            // validate contents of the params
            const referredProcessParams = copy.deepCopyObject(processParams);
            let isValid = true;
            for (const key in referredProcessParams) {
                if (referredProcessParams[key].is_required) {
                    if (Object.prototype.hasOwnProperty.call(params, key)) {
                        const value = params[key].value;
                        if (!dataTypeValidator.data_types[referredProcessParams[key].type].verify(value)) {
                            isValid = false;
                        }
                    } else {
                        isValid = false;
                    }
                }

                if (!isValid) break;
            }

            if (!isValid) return;

            const result = verify(referredProcessParams.collectionName.value, referredProcessParams.data.value);
            console.log(require('util').inspect(
                result,
                false,
                null,
                true
            ));

            referredProcessParams.client.value = new MongoClient(url);
            await referredProcessParams.client.value.connect();

            if (result.isSuccess) {
                referredProcessParams.data.value = result.processedData;
                isSuccess = await selectedProcess.process(referredProcessParams);
            }

            await referredProcessParams.client.value.close();
        } catch (e) {
            console.error(e);
        } finally {
            return isSuccess;
        }
    },
    getProcessParams: () => {
        const filteredParams = {};
        for (const key in processParams) if (processParams[key].is_required) filteredParams[key] = processParams[key];
        return filteredParams;
    },
}