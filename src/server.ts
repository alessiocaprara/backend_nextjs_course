import mongoose from "mongoose";
import app from "./app";
import env from "./utils/validateEnv";
import dns from "node:dns";

dns.setDefaultResultOrder('ipv4first');

const port = env.PORT;

mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log("Mongoose connected");
        app.listen(port, () => {
            console.log("Server running on port: " + port);
        });
    })
    .catch(console.error);

/**
 * This file is double checked: ok (24_04_2023 19:20).
 */