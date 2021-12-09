'use strict'

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const collections = {};

fs
    .readdirSync(__dirname)
    .filter(file => {
        // filter all found files
        // remove base file (index.collection.js) and any files which is not javascript files
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
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