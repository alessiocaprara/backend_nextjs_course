import MongoStore from "connect-mongo";
import crypto from "crypto";
import { CookieOptions } from "express";
import { SessionOptions } from "express-session";
import env from "../utils/validateEnv";

// File check: 30/5/2023
// Comment: genid build a session id starting with authenticated user id.
// is it possible to add a field in the document to serach for? 

const cookieConfig: CookieOptions = {
    maxAge: 60 * 60 * 1000, // cookie validity: 1 hour
}

if (env.NODE_ENV === "production") {
    cookieConfig.secure = true;
}

const sessionConfig: SessionOptions = {
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: cookieConfig,
    rolling: true,
    store: MongoStore.create({ mongoUrl: env.MONGO_CONNECTION_STRING }),
    genid(req) {
        const userId = req.user?._id;
        const randomId = crypto.randomUUID().toString();
        if (userId) {
            return `${userId}-${randomId}`;
        } else {
            return randomId;
        }
    },
}

export default sessionConfig;