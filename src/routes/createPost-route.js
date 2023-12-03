const express = require("express");
const upload = require("../middlewares/upload");
const authenticateMiddleware = require("../middlewares/authenticate");
const createPostController = require("../controllers/createPost-controller");
const likeController = require("../controllers/like-controller");
const commentController = require("../controllers/comment-controller");

const router = express.Router();

router.post(
  "/createPost",
  authenticateMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1
    }
  ]),
  createPostController.createPost
);

router.get("/getCreatePost", createPostController.getCreatePost);
router.get("/getCreatePost/:userId", createPostController.getCreatePostById);

router.post(
  "/:postId/likes",
  authenticateMiddleware,
  likeController.createLike
);
router.delete("/:postId/likes", authenticateMiddleware, likeController.unlike);

router.post(
  "/:postId/comments",
  authenticateMiddleware,
  commentController.createComment
);

router.post(
  "/:postId/editComments",
  authenticateMiddleware,
  commentController.editComment
);

router.delete(
  "/:commentId",
  authenticateMiddleware,
  commentController.deleteCommentId
);

module.exports = router;
