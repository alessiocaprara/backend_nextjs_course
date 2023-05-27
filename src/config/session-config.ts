import MongoStore from "connect-mongo";
import crypto from "crypto";
import { CookieOptions } from "express";
import { SessionOptions } from "express-session";
import env from "../utils/validateEnv";

const cookieConfig: CookieOptions = {
    maxAge: 12 * 60 * 60 * 1000, // cookie validity: 12 hour
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