module.exports = (app) => {
    const fs = require("fs");
    const https = require("https");
    return https.createServer({
        key: fs.readFileSync("./serwer/https/localhost.key"),
        cert: fs.readFileSync("./serwer/https/localhost.cert")
    }, app);
};
