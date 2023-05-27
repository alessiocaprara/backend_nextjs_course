import { rateLimit } from "express-rate-limit"

export const loginRateLimit = rateLimit({
    windowMs: 3 * 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

export const requestVerificationCodeRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});

export const createPostsRateLimit = rateLimit({
    windowMs: 1 * 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});

export const updatePostRateLimit = rateLimit({
    windowMs: 1 * 60 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});

export const updateImageRateLimit = rateLimit({
    windowMs: 1 * 60 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
});