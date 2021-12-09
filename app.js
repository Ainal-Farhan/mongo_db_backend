require('dotenv').config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const dbManager = require("./db/index.db");

(async () => {
    await dbManager.startProcess(dbManager.processes.insert_one.process_name, ["users", { first_name: ["Ainal Farhan"] }]);
})();

const PORT = 8380;
app.listen(PORT, function () {
    console.log('server listen to port:%s', PORT);
});

module.exports = app;