const mongoose = require("mongoose");

const checkschema = new mongoose.Schema ({
    hwid: String,
    ip: String,
    checkpoint: Number
});

module.exports = mongoose.model("checkschema", checkschema);