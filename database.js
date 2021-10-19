//include library
const mongoose = require("mongoose");
const assert = require("assert");
const db_url = process.env.DB_URL;


//Establish Database Connection
mongoose.connect(
    db_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true
        // useFindAndModify: true
    },
    (error, link) => {
        // check databae connect error
        assert.strictEqual(error, null, "DB Connect Fail...");
        console.log("Database connection established...")
    }
);