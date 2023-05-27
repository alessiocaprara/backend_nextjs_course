import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
    NODE_ENV: str(),
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    SESSION_SECRET: str(),
    WEBSITE_URL: str(),
    SERVER_URL: str(),
    POST_REVALIDATION_KEY: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    GITHUB_CLIENT_ID: str(),
    GITHUB_CLIENT_SECRET: str(),
    SMTP_PASSWORD: str(),
});

export default env;