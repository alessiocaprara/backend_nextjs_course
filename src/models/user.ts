import { InferSchemaType, Schema, model } from "mongoose";

// File check: 30/5/2023
// Comment: OK but I think it could be optimized from the skratch

const userSchema = new Schema({
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true, select: false },
    displayName: { type: String },
    about: { type: String },
    profilePicUrl: { type: String },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    githubId: { type: String, unique: true, sparse: true, select: false },
}, { timestamps: true });

userSchema.pre("validate", function (next) {
    if (!this.email && !this.googleId && !this.githubId) {
        return next(new Error("User must have an email or social provider Id"));
    }
    next();
});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);