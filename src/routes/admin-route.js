const express = require("express");
const tagController = require("../controllers/tag-controller");
const postController = require("../controllers/post-controller");
const userController = require("../controllers/user-controller");
const adminController = require("../controllers/admin-controller");
const authenticateMiddleware = require("../middlewares/authenticate");
const commentController = require("../controllers/comment-controller");

const router = express.Router();

router.delete("/tag/:tagId", authenticateMiddleware, tagController.deleteTag);

router.delete(
  "/post/:postId",
  authenticateMiddleware,
  postController.deletePost
);

router.post(
  "/post/updateStatusPostHidePost/:postId",
  authenticateMiddleware,
  postController.updateStatusPostHidePost
);
router.post(
  "/post/updateStatusPostShowPost/:postId",
  authenticateMiddleware,
  postController.updateStatusPostShowPost
);

router.delete(
  "/user/:userId",
  authenticateMiddleware,
  userController.deleteUser
);

router.post(
  "/user/updateStatusBanUser/:userId",
  authenticateMiddleware,
  userController.updateStatusBanUser
);

router.post(
  "/user/updateStatusShowUser/:userId/:countdown",
  authenticateMiddleware,
  userController.updateStatusShowUser
);

router.get("/historyPost", adminController.getHistoryPost);

router.post(
  "/restoredPost/:adminHistoryRestoreId",
  authenticateMiddleware,
  adminController.restoredPost
);

router.delete(
  "/deleteRestoredPost/:adminHistoryRestoreId",
  authenticateMiddleware,
  adminController.deleteRestoredPost
);

router.delete(
  "/comments",
  authenticateMiddleware,
  commentController.adminDeleteCommentId
);

router.get("/getComment", commentController.getComment);

module.exports = router;
