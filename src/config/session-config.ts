import MongoStore from "connect-mongo";
import RedisStore from "connect-redis";
import crypto from "crypto";
import { SessionOptions } from "express-session";
import env from "../utils/validateEnv";
import redisClient from "./redis-config";

const store = env.NODE_ENV === "production"
    ? new RedisStore({ client: redisClient })
    : MongoStore.create({ mongoUrl: env.MONGO_CONNECTION_STRING })

const sessionConfig: SessionOptions = {
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 12 * 60 * 60 * 1000, // cookie validity: 12 hour
    },
    rolling: true,
    store: store,
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