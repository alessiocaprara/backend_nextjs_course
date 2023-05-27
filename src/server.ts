import mongoose from "mongoose";
import app from "./app";
import env from "./utils/validateEnv";
import dns from "node:dns";

dns.setDefaultResultOrder('ipv4first');

const port = env.PORT;

if (env.NODE_ENV === "production") {
    console.log("Server running in production mode");
} else {
    console.log("Server running in development mode");
}

mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log("Mongoose connected");
        app.listen(port, () => {
            console.log("Server running on port: " + port);
        });
    })
    .catch(console.error);