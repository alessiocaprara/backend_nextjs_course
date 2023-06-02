import { InferSchemaType, Schema, model } from "mongoose";

// TODO: Should be defined a key <email, verificationCode>

const passwordResetTokenSchema = new Schema({
    email: { type: String, required: true },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: "10m" }
});

type PasswordResetToken = InferSchemaType<typeof passwordResetTokenSchema>;

export default model<PasswordResetToken>("PasswordResetToken", passwordResetTokenSchema);