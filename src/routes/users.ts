import express from "express";
import passport from "passport";
import * as UsersController from "../controllers/users";
import { profilePicUpload } from "../middlewares/image-upload";
import { loginRateLimit, requestVerificationCodeRateLimit } from "../middlewares/rateLimit";
import requiresAuth from "../middlewares/requiresAuth";
import setSessionReturnTo from "../middlewares/setSessionReturnTo";
import validateRequestSchema from "../middlewares/validateRequestSchema";
import env from "../utils/validateEnv";
import { requestEmailVerificationCodeSchema, requestResetPasswordCodeSchema, resetPasswordSchema, signUpSchema, updateUserSchema } from "../validation/users";

const router = express.Router();

router.get("/me", requiresAuth, UsersController.getAuthenticatedUser);
router.get("/profile/:username", UsersController.getUserByUsername);
router.post("/signup", validateRequestSchema(signUpSchema), UsersController.signUp);
router.post("/login", loginRateLimit, passport.authenticate("local"), (req, res) => res.status(200).json(req.user));
router.get("/login/google", setSessionReturnTo, passport.authenticate("google"));
router.get("/oauth2/redirect/google", passport.authenticate("google", {
    successReturnToOrRedirect: env.WEBSITE_URL,
    keepSessionInfo: true,
}));
router.get("/login/github", setSessionReturnTo, passport.authenticate("github"));
router.get("/oauth2/redirect/github", passport.authenticate("github", {
    successReturnToOrRedirect: env.WEBSITE_URL,
    keepSessionInfo: true,
}));
router.post("/email-verification-code", requestVerificationCodeRateLimit, validateRequestSchema(requestEmailVerificationCodeSchema), UsersController.requestEmailVerificationCode);
router.post("/reset-password-code", requestVerificationCodeRateLimit, validateRequestSchema(requestResetPasswordCodeSchema), UsersController.requestResetPasswordCode);
router.post("/reset-password", validateRequestSchema(resetPasswordSchema), UsersController.resetPassword);
router.post("/logout", UsersController.logOut);
router.patch("/me", requiresAuth, profilePicUpload.single("profilePic"), validateRequestSchema(updateUserSchema), UsersController.updateUser);

export default router;