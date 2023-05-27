import express from "express";
import * as PostsController from "../controllers/posts";
import { featuredImageUpload, inPostImageUpload } from "../middlewares/image-upload";
import { createPostsRateLimit, updateImageRateLimit, updatePostRateLimit } from "../middlewares/rateLimit";
import requiresAuth from "../middlewares/requiresAuth";
import validateRequestSchema from "../middlewares/validateRequestSchema";
import { createCommentSchema, createPostSchema, deleteCommentSchema, deletePostSchema, getCommentRepliesSchema, getCommentsForPostSchema, getPostsSchema, updateCommentSchema, updatePostSchema, uploadInPostImageSchema } from "../validation/posts";

const router = express.Router();

router.get("/", validateRequestSchema(getPostsSchema), PostsController.getPosts);
router.get("/slugs", PostsController.getAllPostsSlugs);
router.get("/post/:slug", PostsController.getPostBySlug);
router.post("/", requiresAuth, createPostsRateLimit, featuredImageUpload.single("featuredImage"), validateRequestSchema(createPostSchema), PostsController.createPost);
router.patch("/:postId", requiresAuth, updatePostRateLimit, featuredImageUpload.single("featuredImage"), validateRequestSchema(updatePostSchema), PostsController.updatePost);
router.delete("/:postId", requiresAuth, validateRequestSchema(deletePostSchema), PostsController.deletePost);

router.post("/images", requiresAuth, updateImageRateLimit, inPostImageUpload.single("inPostImage"), validateRequestSchema(uploadInPostImageSchema), PostsController.uploadInPostImage);

router.get("/:postId/comments", validateRequestSchema(getCommentsForPostSchema), PostsController.getCommentsForPost);
router.post("/:postId/comments", requiresAuth, validateRequestSchema(createCommentSchema), PostsController.createComment);
router.get("/comments/:commentId/replies", validateRequestSchema(getCommentRepliesSchema), PostsController.getCommentReplies);
router.patch("/comments/:commentId", requiresAuth, validateRequestSchema(updateCommentSchema), PostsController.updateComment);
router.delete("/comments/:commentId", requiresAuth, validateRequestSchema(deleteCommentSchema), PostsController.deleteComment);

export default router;