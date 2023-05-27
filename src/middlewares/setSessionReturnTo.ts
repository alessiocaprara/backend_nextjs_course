import { RequestHandler } from "express";
import env from "../utils/validateEnv";

const setSessionReturnTo: RequestHandler = (req, res, next) => {
    const { returnTo } = req.query;
    if (returnTo) {
        req.session.returnTo = env.WEBSITE_URL + returnTo;
    }
    next();
}

export default setSessionReturnTo;