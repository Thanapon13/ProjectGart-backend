const express = require("express");

const followController = require("../controllers/follow-controller");

const router = express.Router();

router.post("/:userId", followController.requestFollow);
router.delete("/:followId", followController.deleteFollow);

module.exports = router;