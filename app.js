require('dotenv').config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const dbManager = require("./db");

(async () => {
    await dbManager.sync(false);
    const params = dbManager.getProcessParams();
    if (params !== null) {
        params.collectionName.value = "users";
        params.data.value = {first_name: "ainal farhan" };
        console.log("insert: " + (await dbManager.startProcess("insert_one", params) ? "success" : "failed"));
    }
})();

const PORT = 8380;
app.listen(PORT, function () {
    console.log('server listen to port:%s', PORT);
});

module.exports = app;