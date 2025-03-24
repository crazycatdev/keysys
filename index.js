const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
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

    const usedkey = await keyschema.findOne({ hwid: hwid });
    if (usedkey) {
        return res.send(usedkey.key);
    };

    const stepToken = crypto.randomBytes(16).toString("hex");

    await checkschema.create({
        hwid: hwid,
        ip: ip,
        checkpoint: 1,
        stepToken: stepToken,
        lastUpdatedAt: Date.now()
    });

    res.redirect(linkvertise(69420, `http://localhost:3000/c2?stepToken=${stepToken}`));
});

app.get("/c2", async (req, res) => {
    const ip = req.socket.remoteAddress;
    const stepToken = req.query.stepToken;

    if (!stepToken) {
        return res.send("nice try.");
    };

    const checkpoint = await checkschema.findOne({ ip: ip, stepToken: stepToken });

    if (!checkpoint || checkpoint.checkpoint !== 1) {
        return res.send("checkpoint invalid. press get key on your app.");
    };

    if (Date.now() - checkpoint.lastUpdatedAt > 1000 * 60 * 5) {
        await checkpoint.deleteOne();
        return res.send("session expired. press get key on your app.");
    };

    const stepTokenNew = crypto.randomBytes(16).toString("hex");

    checkpoint.checkpoint = 2;
    checkpoint.stepToken = stepTokenNew;
    checkpoint.lastUpdatedAt = Date.now();
    await checkpoint.save();
    res.redirect(linkvertise(69420, `http://localhost:3000/getkey?stepToken=${stepTokenNew}`));
});

app.get("/getkey", async (req, res) => {
    const ip = req.socket.remoteAddress;
    const stepToken = req.query.stepToken;

    if (!stepToken) {
        return res.send("nice try");
    };

    const checkpoint = await checkschema.findOne({ ip: ip, stepToken: stepToken });

    if (!checkpoint || checkpoint.checkpoint !== 2) {
        return res.send("no checkpoint found. press get key on your app.");
    };

    if (Date.now() - checkpoint.lastUpdatedAt > 1000 * 60 * 5) {
        await checkpoint.deleteOne();
        return res.send("session expired. press get key on your app.");
    };

    const key = await keygen();

    await keyschema.create({
        hwid: checkpoint.hwid,
        key: key,
        endsAt: Date.now() + 1000 * 60 * 60 * 24
    });

    await checkpoint.deleteOne();
    res.send(key);
});

app.get("/checkkey", async (req, res) => {
    const key = req.query.key;
    const hwid = req.query.hwid;
    const keydata = await keyschema.findOne({ hwid: hwid, key: key });

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