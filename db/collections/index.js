'use strict'

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const collections = {};

fs
    .readdirSync(__dirname)
    .filter(file => {
        // filter all found files
        // remove base file (index.js) and any files which is not javascript files
        const fileExt = ".collection.js";
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-Math.abs(fileExt.length)) === fileExt);
    })
    .forEach(file => {
        // import file
        const collection = require(path.join(__dirname, file));
        collections[collection.collectionName] = {
            attributes: collection.attributes
        }
    });

module.exports = {
    collections
};