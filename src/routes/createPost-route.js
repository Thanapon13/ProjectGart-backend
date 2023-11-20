const express = require("express");
const upload = require("../middlewares/upload");
const authenticateMiddleware = require("../middlewares/authenticate");
const createPostController = require("../controllers/createPost-controller");

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

module.exports = router;
