const express = require("express");

const followController = require("../controllers/follow-controller");
const authenticateMiddleware = require("../middlewares/authenticate");

const router = express.Router();

router.post("/:userId", authenticateMiddleware, followController.requestFollow);
router.delete(
  "/:followId",
  authenticateMiddleware,
  followController.deleteFollow
);
router.get("/getFollow", followController.getCreateFollow);

module.exports = router;
