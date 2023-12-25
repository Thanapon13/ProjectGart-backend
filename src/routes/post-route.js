const express = require("express");
const upload = require("../middlewares/upload");
const authenticateMiddleware = require("../middlewares/authenticate");
const postController = require("../controllers/post-controller");
const likeController = require("../controllers/like-controller");
const commentController = require("../controllers/comment-controller");

const router = express.Router();

// router.post(
//   "/createPost",
//   authenticateMiddleware,
//   upload.fields([
//     {
//       name: "image",
//       maxCount: 1
//     }
//   ]),
//   postController.createPost
// );

router.post(
  "/createPost",
  authenticateMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1
    }
  ]),
  postController.createPost
);

router.get("/getCreatePost", postController.getCreatePost);

router.post(
  "/editPost/:postId",
  authenticateMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1
    }
  ]),
  postController.editPost
);

router.get("/getCreatePost/:userId", postController.getCreatePostById);

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
  "/:commentId/comments",
  authenticateMiddleware,
  commentController.deleteCommentId
);

router.get("/search", postController.getBySearch);

module.exports = router;
