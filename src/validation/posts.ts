import mongoose from "mongoose";
import { validateBufferMIMEType } from "validate-image-type";
import * as yup from "yup";
import isPositiveInteger from "../utils/isPositiveInteger";

//-------------------------------------------------------------------------- CUSTOM REUSABLE SCHEMAS
const objectIdSchema = yup.string()
    .test(
        "is-objectId",
        "${path} is not a valid ObjectId",
        value => !value || mongoose.Types.ObjectId.isValid(value),
    );

const imageFileSchema = yup.mixed<Express.Multer.File>()
    .test(
        "valid-image",
        "the uploaded file is not a valid image",
        async file => {
            if (!file) return true;
            const result = await validateBufferMIMEType(file.buffer,
                {
                    allowMimeTypes: ["image/png", "image/jpeg"]
                });
            return result.ok
        }
    );

const pageSchema = yup.string()
    .test(
        "valid-page",
        "the page number is not valid",
        async pageNum => {
            if (!pageNum) return true;
            return isPositiveInteger(pageNum);
        }
    );

//-----------------------------------------------------------------------------------------------POSTS
//------------------------------------------------------------------- getPosts
export const getPostsSchema = yup.object({
    query: yup.object({
        authorId: objectIdSchema,
        page: pageSchema,
    }),
});

export type GetPostsQuery = yup.InferType<typeof getPostsSchema>["query"];

//------------------------------------------------------------------- createPost
export const createPostSchema = yup.object({
    body: yup.object({
        title: yup.string().required().max(100),
        slug: yup.string().required().max(100).matches(/^[a-zA-Z0-9_-]*$/),
        summary: yup.string().required().max(300),
        body: yup.string().required(),
    }),
    file: imageFileSchema.required("Featured image required"),
});

export type CreatePostBody = yup.InferType<typeof createPostSchema>["body"];

//------------------------------------------------------------------- updatePost
export const updatePostSchema = yup.object({
    params: yup.object({
        postId: objectIdSchema.required(),
    }),
    body: yup.object({
        title: yup.string().required().max(100),
        slug: yup.string().required().max(100).matches(/^[a-zA-Z0-9_-]*$/),
        summary: yup.string().required().max(300),
        body: yup.string().required(),
    }),
    file: imageFileSchema,
});

export type UpdatePostParams = yup.InferType<typeof updatePostSchema>["params"];
export type UpdatePostBody = yup.InferType<typeof updatePostSchema>["body"];

//------------------------------------------------------------------- deletePost
export const deletePostSchema = yup.object({
    params: yup.object({
        postId: objectIdSchema.required(),
    }),
});

export type DeletePostParams = yup.InferType<typeof deletePostSchema>["params"];

//------------------------------------------------------------------- uploadInPostImage
export const uploadInPostImageSchema = yup.object({
    file: imageFileSchema.required("Image required"),
});

//-----------------------------------------------------------------------------------------------COMMENTS
//------------------------------------------------------------------- getCommentsForPost
export const getCommentsForPostSchema = yup.object({
    params: yup.object({
        postId: objectIdSchema.required(),
    }),
    query: yup.object({
        continueAfterId: objectIdSchema,
    }),
});

export type GetCommentsForPostParams = yup.InferType<typeof getCommentsForPostSchema>["params"];
export type GetCommentsForPostQuery = yup.InferType<typeof getCommentsForPostSchema>["query"];

//------------------------------------------------------------------- createComment
export const createCommentSchema = yup.object({
    body: yup.object({
        text: yup.string().required().max(600),
        parentCommentId: objectIdSchema,
    }),
    params: yup.object({
        postId: objectIdSchema.required(),
    }),
});

export type CreateCommentParams = yup.InferType<typeof createCommentSchema>["params"];
export type CreateCommentBody = yup.InferType<typeof createCommentSchema>["body"];

//------------------------------------------------------------------- getCommentsReplies
export const getCommentRepliesSchema = yup.object({
    params: yup.object({
        commentId: objectIdSchema.required(),
    }),
    query: yup.object({
        continueAfterId: objectIdSchema,
    }),
});

export type GetCommentRepliesParams = yup.InferType<typeof getCommentRepliesSchema>["params"];
export type GetCommentRepliesQuery = yup.InferType<typeof getCommentRepliesSchema>["query"];

//------------------------------------------------------------------- updateComment
export const updateCommentSchema = yup.object({
    body: yup.object({
        newText: yup.string().required().max(600),
    }),
    params: yup.object({
        commentId: objectIdSchema.required(),
    }),
});

export type UpdateCommentBody = yup.InferType<typeof updateCommentSchema>["body"];
export type UpdateCommentParams = yup.InferType<typeof updateCommentSchema>["params"];

//------------------------------------------------------------------- deleteComment
export const deleteCommentSchema = yup.object({
    params: yup.object({
        commentId: objectIdSchema.required(),
    }),
});

export type DeleteCommentParams = yup.InferType<typeof deleteCommentSchema>["params"];