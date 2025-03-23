const mongoose = require("mongoose");

const keyschema = new mongoose.Schema ({
    hwid: String,
    key: String,
    endsAt: Number
});

module.exports = mongoose.model("keyschema", keyschema);