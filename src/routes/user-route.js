const express = require("express");
const userController = require("../controllers/user-controller");
const upload = require("../middlewares/upload");
const authenticateMiddleware = require("../middlewares/authenticate");

const router = express.Router();

router.patch(
  "/",
  authenticateMiddleware,
  //   upload.single("profileImage"),
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  userController.updateProfileImage
);

router.patch(
  "/coverImage",
  authenticateMiddleware,
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  userController.updatecoverImage
);

router.get("/:userId", userController.getUserInfoById);
router.patch("/info", authenticateMiddleware, userController.updateUserInfo);
router.patch("/infoPassword", authenticateMiddleware, userController.updateUserInfoPassword);

module.exports = router;
