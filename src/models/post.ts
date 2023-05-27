import mongoose, { InferSchemaType, Schema, model } from "mongoose";

const postSchema = new Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    body: { type: String, required: true },
    featuredImageUrl: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
}, { timestamps: true });

type Post = InferSchemaType<typeof postSchema>;

export default model<Post>("Post", postSchema);