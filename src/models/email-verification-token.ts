import { InferSchemaType, Schema, model } from "mongoose";

// TODO: Should be defined a key <email, verificationCode>

const emailVerificationTokenSchema = new Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "10m" }
});

type EmailVerificationToken = InferSchemaType<typeof emailVerificationTokenSchema>;

export default model<EmailVerificationToken>("EmailVerificationToken", emailVerificationTokenSchema);