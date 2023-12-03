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

exports.editComment = async (req, res, next) => {
  try {
    const value = req.body;

    console.log("value:", value);
    console.log("req.params.postId", req.params.postId);
    console.log(" req.user.id", req.user.id);

    const editComments = {
      title: value.title,
      postId: req.params.postId,
      userId: req.user.id
    };
    // console.log("editComments:", editComments);

    const pureEditComments = JSON.parse(JSON.stringify(editComments));

    await Comment.update(pureEditComments, {
      where: { id: value.id }
    });

    res.status(201).json({ message: "Edit Completed!!" });
  } catch (err) {
    next(err);
  }
};
exports.deleteCommentId = async (req, res, next) => {
  try {
    console.log("req.params.commentId:", req.params.commentId);
    console.log("req.user.id:", req.user.id);

    const commentToDelete = await Comment.findOne({
      where: {
        id: req.params.commentId,
        userId: req.user.id
      }
    });

    if (!commentToDelete) {
      return res
        .status(404)
        .json({ message: "Comment not found for the user." });
    }

    await commentToDelete.destroy();

    res.status(200).json({ message: "Delete success" });
  } catch (err) {
    next(err);
  }
};
