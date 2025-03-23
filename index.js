const express = require("express");
const mongoose = require("mongoose");
const checkschema = require("./schemas/checkschema");
const linkvertise = require("./functions/linkvertise");
const keyschema = require("./schemas/keyschema");
const keygen = require("./functions/keygen");

const app = express();

async function dbConnection() {
    await mongoose.connect("mongodb://localhost:27017/keysys").then(console.log("db connected!"))
};

app.get("/", (req, res) => {
    res.send("hello world");
});
 
app.get("/c1", async (req, res) => {
    const hwid = req.query.hwid;
    const ip = req.socket.remoteAddress;

    if (!hwid) {
        return res.send("no hwid found. press get key on your app.");
    }

    await keyschema.findOne({hwid: hwid})

    await checkschema.create({
        hwid: hwid,
        ip: ip,
        checkpoint: 1
    });

    res.redirect(linkvertise(69420, "http://localhost:3000/c2"));
});

app.get("/c2", async (req, res) => {
    const ip = req.socket.remoteAddress;
    const checkpoint = await checkschema.findOne({ ip: ip });

    if (!checkpoint) {
        return res.send("no checkpoint found. press get key on your app.");
    };

    checkpoint.checkpoint = 2;
    checkpoint.save();
    res.redirect(linkvertise(69420, "http://localhost:3000/getkey"));
});

app.get("/getkey", async (req, res) => {
    const ip = req.socket.remoteAddress;
    const checkpoint = await checkschema.findOne({ ip: ip });
    const time = 1000 * 60 * 60 * 24; //1000ms * 60 sec * 60 min * 24 hours = 1 day
    const key = await keygen();

    if (!checkpoint) {
        return res.send("no checkpoint found. press get key on your app.");
    } else if (checkpoint.checkpoint !== 2) {
        return res.redirect(linkvertise(69420, "http://localhost:3000/c1?hwid=" + checkpoint.hwid));
    };

    await keyschema.create({
        hwid: checkpoint.hwid,
        key: key,
        endsAt: Date.now() + time
    });

    await checkpoint.deleteOne();
    res.send(key);
});

app.get("/checkkey", async (req, res) => {
    const key = req.query.key;
    const hwid = req.query.hwid;
    const keydata = await keyschema.findOne({hwid: hwid, key: key});

    if (!keydata) {
        return res.send("invalid key");
    } else if (keydata.endsAt <= Date.now()) {
        await keydata.deleteOne();
        return res.send("invalid key");
    } else {
        return res.send("valid key");
    };
});

dbConnection().catch(err => console.log(err));
app.listen(3000, console.log("listening at port 3000!"));