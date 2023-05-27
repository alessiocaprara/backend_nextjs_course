import axios from "axios";
import crypto from "crypto";
import { RequestHandler } from "express";
import fs from "fs";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import path from "path";
import sharp from "sharp";
import CommentModel from "../models/comment";
import PostModel from "../models/post";
import { assertIsDefined } from "../utils/assertIsDefined";
import env from "../utils/validateEnv";
import { CreateCommentBody, CreateCommentParams, CreatePostBody, DeleteCommentParams, DeletePostParams, GetCommentRepliesParams, GetCommentRepliesQuery, GetCommentsForPostParams, GetCommentsForPostQuery, GetPostsQuery, UpdateCommentBody, UpdateCommentParams, UpdatePostBody, UpdatePostParams } from "../validation/posts";

//-----------------------------------------------------------------------------------------------------------------------POSTS
export const getPosts: RequestHandler<unknown, unknown, unknown, GetPostsQuery> = async (req, res, next) => {
    const authorId = req.query.authorId;
    const page = parseInt(req.query.page || "1");
    const filter = authorId ? { author: authorId } : {}
    const PAGE_SIZE = 6;
    try {
        const getPostsQuery = PostModel
            .find(filter)
            .sort({ _id: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .populate("author")
            .exec();
        const countDocumentsQuery = PostModel
            .countDocuments(filter)
            .exec();
        const [posts, totalResults] = await Promise.all([getPostsQuery, countDocumentsQuery]); // paraller execution
        const totalPages = Math.ceil(totalResults / PAGE_SIZE);

        res.status(200).json({
            posts,
            page,
            totalPages,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllPostsSlugs: RequestHandler = async (req, res, next) => {
    try {
        const results = await PostModel
            .find()
            .select("slug")
            .exec();
        const slugs = results.map(post => post.slug)
        res.status(200).json(slugs);
    } catch (error) {
        next(error);
    }
};

export const getPostBySlug: RequestHandler = async (req, res, next) => {
    const slug = req.params.slug;
    try {
        const post = await PostModel
            .findOne({ slug })
            .populate("author")
            .exec();
        if (!post) {
            throw createHttpError(404, "Blog post not found for this slug");
        }
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

export const createPost: RequestHandler<unknown, unknown, CreatePostBody, unknown> = async (req, res, next) => {
    const { slug, title, summary, body } = req.body;
    const featuredImage = req.file;
    const authenticatedUser = req.user;
    try {
        assertIsDefined(featuredImage);
        assertIsDefined(authenticatedUser);
        const existingSlug = await PostModel.findOne({ slug }).exec();
        if (existingSlug) {
            throw createHttpError(409, "Slug already taken. Please choose a different one.");
        }
        const postId = new mongoose.Types.ObjectId();
        const featuredImageDestinationPath = "/uploads/featured-images/" + postId + ".png";
        await sharp(featuredImage.buffer)
            .resize(700, 450)
            .toFile("." + featuredImageDestinationPath);
        const newPost = await PostModel.create({
            _id: postId,
            slug: slug,
            title: title,
            summary: summary,
            body: body,
            featuredImageUrl: env.SERVER_URL + featuredImageDestinationPath,
            author: authenticatedUser._id,
        });
        res.status(201).json(newPost);
    } catch (error) {
        next(error);
    }
};

export const updatePost: RequestHandler<UpdatePostParams, unknown, UpdatePostBody, unknown> = async (req, res, next) => {
    const { postId } = req.params;
    const { slug, title, summary, body } = req.body;
    const featuredImage = req.file;
    const authenticatedUser = req.user;
    try {
        assertIsDefined(authenticatedUser);
        const postWithSameSlug = await PostModel.findOne({ slug }).exec();
        if (postWithSameSlug && !postWithSameSlug._id.equals(postId)) {
            throw createHttpError(409, "Slug already taken. Please choose a different one.");
        }
        const postToEdit = await PostModel.findById(postId).exec();
        if (!postToEdit) { throw createHttpError(404); }
        if (!postToEdit.author?.equals(authenticatedUser._id)) { throw createHttpError(401); }
        postToEdit.slug = slug;
        postToEdit.title = title;
        postToEdit.summary = summary;
        postToEdit.body = body;
        if (featuredImage) {
            const featuredImageDestinationPath = "/uploads/featured-images/" + postId + ".png";
            await sharp(featuredImage.buffer)
                .resize(700, 450)
                .toFile("." + featuredImageDestinationPath);
            postToEdit.featuredImageUrl = env.SERVER_URL + featuredImageDestinationPath + "?lastupdated=" + Date.now();
        }
        await postToEdit.save();
        await axios.get(env.WEBSITE_URL + `/api/revalidate-post/${slug}?secret=${env.POST_REVALIDATION_KEY}`)
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};

export const deletePost: RequestHandler<DeletePostParams, unknown, unknown, unknown> = async (req, res, next) => {
    const { postId } = req.params;
    const authenticatedUser = req.user;
    try {
        assertIsDefined(authenticatedUser);
        const postToDelete = await PostModel.findById(postId).exec();
        if (!postToDelete) { throw createHttpError(404); }
        if (!postToDelete.author?.equals(authenticatedUser._id)) { throw createHttpError(401); }
        if (postToDelete.featuredImageUrl.startsWith(env.SERVER_URL)) {
            const imagePath = postToDelete.featuredImageUrl.split(env.SERVER_URL)[1].split("?")[0];
            fs.unlinkSync("." + imagePath);
        }
        await postToDelete.deleteOne();
        await axios.get(env.WEBSITE_URL + `/api/revalidate-post/${postToDelete.slug}?secret=${env.POST_REVALIDATION_KEY}`)
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

export const uploadInPostImage: RequestHandler = async (req, res, next) => {
    const image = req.file;
    try {
        assertIsDefined(image);
        const fileName = crypto.randomBytes(20).toString("hex");
        const imageDestinationPath = "/uploads/in-post-images/" + fileName + path.extname(image.originalname);
        await sharp(image.buffer)
            .resize(1920, undefined, { withoutEnlargement: true })
            .toFile("." + imageDestinationPath);
        res.status(201).json({ imageUrl: env.SERVER_URL + imageDestinationPath });
    } catch (error) {
        next(error);
    }
}

//-----------------------------------------------------------------------------------------------------------------------COMMENTS
export const getCommentsForPost: RequestHandler<GetCommentsForPostParams, unknown, unknown, GetCommentsForPostQuery> = async (req, res, next) => {
    const { postId } = req.params;
    const { continueAfterId } = req.query;

    const PAGE_SIZE = 3;

    try {
        const query = CommentModel
            .find({ postId, parentCommentId: undefined }) // Only top level comments
            .sort({ _id: -1 }); // newest at the top

        if (continueAfterId) {
            query.lt("_id", continueAfterId); // lt = less than (older comments)
        }

        const result = await query
            .limit(PAGE_SIZE + 1)
            .populate("author")
            .exec();

        const comments = result.slice(0, PAGE_SIZE);
        const endOfPaginationReached = result.length <= PAGE_SIZE;

        const commentsWithRepliesCount = await Promise.all(comments.map(async comment => {
            const repliesCount = await CommentModel.countDocuments({ parentCommentId: comment._id });
            return { ...comment.toObject(), repliesCount }
        }));

        res.status(200).json({
            comments: commentsWithRepliesCount,
            endOfPaginationReached,
        });
    } catch (error) {
        next(error);
    }
};

export const getCommentReplies: RequestHandler<GetCommentRepliesParams, unknown, unknown, GetCommentRepliesQuery> = async (req, res, next) => {
    const { commentId: parentCommentId } = req.params;
    const { continueAfterId } = req.query;

    const PAGE_SIZE = 2;

    try {
        const query = CommentModel
            .find({ parentCommentId })
            .sort({ _id: 1 }); // newest at the bottom (default)

        if (continueAfterId) {
            query.gt("_id", continueAfterId); // gt = grater than (newer comments)
        }

        const result = await query
            .limit(PAGE_SIZE + 1)
            .populate("author")
            .exec();

        const comments = result.slice(0, PAGE_SIZE);
        const endOfPaginationReached = result.length <= PAGE_SIZE;

        res.status(200).json({
            comments,
            endOfPaginationReached,
        });
    } catch (error) {
        next(error);
    }
};

export const createComment: RequestHandler<CreateCommentParams, unknown, CreateCommentBody, unknown> = async (req, res, next) => {
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;
    const authenticatedUser = req.user;
    try {
        assertIsDefined(authenticatedUser);

        const newComment = await CommentModel.create({
            postId,
            text,
            author: authenticatedUser, // TODO: ALERT, could be an error
            parentCommentId,
        });

        await CommentModel.populate(newComment, { path: "author" });

        res.status(201).json(newComment);
    } catch (error) {
        next(error);
    }
};

export const updateComment: RequestHandler<UpdateCommentParams, unknown, UpdateCommentBody, unknown> = async (req, res, next) => {
    const { commentId } = req.params;
    const { newText } = req.body;
    const authenticatedUser = req.user;
    try {
        assertIsDefined(authenticatedUser);

        const commentToUpdate = await CommentModel
            .findById(commentId)
            .populate("author")
            .exec();

        if (!commentToUpdate) {
            throw createHttpError(404, "Comment not found");
        }
        if (!commentToUpdate.author.equals(authenticatedUser._id)) {
            throw createHttpError(401); // Not authorized
        }
        commentToUpdate.text = newText;
        await commentToUpdate.save();
        res.status(200).json(commentToUpdate);
    } catch (error) {
        next(error);
    }
};

export const deleteComment: RequestHandler<DeleteCommentParams, unknown, unknown, unknown> = async (req, res, next) => {
    const { commentId } = req.params;
    const authenticatedUser = req.user;
    try {
        assertIsDefined(authenticatedUser);
        const commentToDelete = await CommentModel.findById(commentId).exec();
        console.log(commentToDelete);

        if (!commentToDelete) {
            throw createHttpError(404, "Comment not found");
        }
        if (!commentToDelete.author.equals(authenticatedUser._id)) {
            throw createHttpError(401); // Not authorized
        }
        await commentToDelete.deleteOne();
        await CommentModel.deleteMany({ parentCommentId: commentId }).exec();
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
};