const { Comment } = require("../models");

exports.createComment = async (req, res, next) => {
  try {
    console.log("req.body.title", req.body.title);
    console.log("req.params.postId", req.params.postId);
    console.log(" req.user.id", req.user.id);

    const comment = await Comment.create({
      title: req.body.title,
      postId: req.params.postId,
      userId: req.user.id
    });
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};
