const { AdminHistoryRestore, User, Comment, Like, Post } = require("../models");

exports.getHistoryPost = async (req, res, next) => {
  try {
    const historyPost = await AdminHistoryRestore.findAll({
      include: [
        {
          model: User,
          attributes: [
            "firstName",
            "lastName",
            "id",
            "email",
            "profileImage",
            "coverImage"
          ]
        }
      ]
    });

    const formattedHistoryPost = historyPost.map(post => {
      return {
        ...post.dataValues,
        imagePost: JSON.parse(post.imagePost)[0]
      };
    });

    res.status(201).json({ historyPost: formattedHistoryPost });
  } catch (err) {
    next(err);
  }
};

exports.restoredPost = async (req, res, next) => {
  try {
    console.log(
      "req.params.adminHistoryRestoreId:",
      req.params.adminHistoryRestoreId
    );

    const restoredPostData = await AdminHistoryRestore.findOne({
      where: {
        id: req.params.adminHistoryRestoreId
      }
    });

    if (!restoredPostData) {
      return res
        .status(404)
        .json({ message: "RestoredPostData not found for the user." });
    }

    console.log("restoredPostData:", restoredPostData);

    const createPost = {
      image: restoredPostData.imagePost,
      title: restoredPostData.titlePost,
      description: restoredPostData.description,
      tagId: restoredPostData.tagId,
      userId: restoredPostData.userId
    };

    console.log("createPost:", createPost);

    const adminHistory = await Post.create(createPost);
    console.log("adminHistory:", adminHistory);

    await restoredPostData.destroy();

    res.status(200).json({ message: " Restored Post success" });
  } catch (err) {
    next(err);
  }
};
