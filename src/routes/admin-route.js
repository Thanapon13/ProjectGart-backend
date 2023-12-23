const express = require("express");
const tagController = require("../controllers/tag-controller");
const postController = require("../controllers/post-controller");
const userController = require("../controllers/user-controller");
const adminController = require("../controllers/admin-controller");

const router = express.Router();

router.delete("/tag/:tagId", tagController.deleteTag);

router.delete("/post/:postId", postController.deletePost);

router.post(
  "/post/updateStatusPostHidePost/:postId",
  postController.updateStatusPostHidePost
);
router.post(
  "/post/updateStatusPostShowPost/:postId",
  postController.updateStatusPostShowPost
);

router.delete("/user/:userId", userController.deleteUser);

router.post(
  "/user/updateStatusBanUser/:userId",
  userController.updateStatusBanUser
);

router.post(
  "/user/updateStatusShowUser/:userId/:countdown",
  userController.updateStatusShowUser
);

router.get("/historyPost", adminController.getHistoryPost);

router.post(
  "/restoredPost/:adminHistoryRestoreId",
  adminController.restoredPost
);

router.delete(
  "/deleteRestoredPost/:adminHistoryRestoreId",
  adminController.deleteRestoredPost
);

module.exports = router;
