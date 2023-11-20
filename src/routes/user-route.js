const express = require("express");
const userController = require("../controllers/user-controller");
const upload = require("../middlewares/upload");

const router = express.Router();

router.patch(
  "/",
  //   upload.single("profileImage"),
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  userController.updateProfileImage
);

router.patch("/info", userController.updateUserInfo);

module.exports = router;
