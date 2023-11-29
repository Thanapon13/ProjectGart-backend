const express = require("express");
const upload = require("../middlewares/upload");
const authenticateMiddleware = require("../middlewares/authenticate");
const tagController = require("../controllers/tag-controller");

const router = express.Router();

router.get("/getTag", tagController.getTag);

router.post(
  "/createTage",
  authenticateMiddleware,
  upload.fields([
    {
      name: "image",
      maxCount: 1
    }
  ]),
  tagController.createTag
);

router.delete("/:tagId", authenticateMiddleware, tagController.deleteTag);

module.exports = router;
