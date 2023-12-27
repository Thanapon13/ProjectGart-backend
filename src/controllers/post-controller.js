const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const {
  Post,
  User,
  Tag,
  Like,
  Comment,
  AdminHistoryRestore
} = require("../models");
const { Op } = require("sequelize");
const { HIDE_POST, SHOW_POST } = require("../config/constant");
const createError = require("../utils/create-error");

exports.createPost = async (req, res, next) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({ message: "Post image is required" });
    }

    const postImages = [];
    for (let i = 0; i < req.files.image.length; i++) {
      const image = await cloudinary.uploaPostImage(req.files.image[i].path);
      console.log("image:", image);
      postImages.push(image);
      console.log("Uploaded image:", image);
      fs.unlinkSync(req.files.image[i].path);
    }
    const value = {
      image: JSON.stringify(postImages),
      title: req.body.title,
      description: req.body.description,
      userId: req.body.userId,
      tagId: req.body.tagId
    };
    console.log("Value:", value);
    await Post.create(value);
    return res.status(200).json({ message: "Successfully updated" });
  } catch (err) {
    next(err);
  }
};

// exports.createPost = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.image || req.files.image.length === 0) {
//       return res.status(400).json({ message: "Post image is required" });
//     }

//     const quantity = 4;

//     for (let d = 0; d < quantity; d++) {
//       const postImages = [];

//       for (let i = 0; i < req?.files?.image?.length; i++) {
//         const image = await cloudinary.uploaPostImage(req.files.image[i].path);
//         postImages.push(image);
//       }

//       const value = {
//         image: JSON.stringify(postImages),
//         title: req.body.title,
//         description: req.body.description,
//         userId: req.body.userId,
//         tagId: req.body.tagId
//       };

//       await Post.create(value);
//     }

//     return res.status(200).json({ message: "Successfully created" });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getCreatePost = async (req, res, next) => {
  try {
    const createPost = await Post.findAll({
      attributes: [
        "id",
        "title",
        "description",
        "image",
        "status",
        "createdAt"
      ],
      include: [
        { model: Tag, attributes: ["TagName", "id"] },
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
        },

        {
          model: Like,
          include: {
            model: User,
            attributes: {
              exclude: ["password"]
            }
          }
        },
        {
          model: Comment,
          include: {
            model: User,
            attributes: {
              exclude: ["password"]
            }
          }
        }
      ]
    });

    console.log("createPost:", createPost);

    const pureCreatePost = JSON.parse(JSON.stringify(createPost));

    console.log("pureCreatePost:", pureCreatePost);

    res.status(201).json({ pureCreatePost });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { userId, tagId } = req.body;
    console.log("userId:", userId);
    console.log("tagId:", tagId);
    console.log("req.params.postId:", req.params.postId);

    const postDelete = await Post.findOne({
      where: {
        id: req.params.postId,
        userId: userId,
        tagId: tagId
      },
      include: [Comment, Like]
    });

    if (!postDelete) {
      return res
        .status(404)
        .json({ message: "Comment not found for the user." });
    }

    const pureCreatePostToHistory = JSON.parse(JSON.stringify(postDelete));
    console.log("pureCreatePostToHistory:", pureCreatePostToHistory);

    const createPostToHistory = {
      titlePost: pureCreatePostToHistory.title,
      imagePost: pureCreatePostToHistory.image,
      description: pureCreatePostToHistory.description,
      tagId: pureCreatePostToHistory.tagId,
      userId: pureCreatePostToHistory.userId
    };

    const adminHistory = await AdminHistoryRestore.create(createPostToHistory);
    console.log("adminHistory:", adminHistory);

    await Comment.destroy({
      where: {
        postId: req.params.postId
      }
    });

    await Like.destroy({
      where: {
        postId: req.params.postId
      }
    });

    await postDelete.destroy();

    res.status(200).json({ message: "Delete success" });
  } catch (err) {
    next(err);
  }
};

exports.getCreatePostById = async (req, res, next) => {
  try {
    const createPost = await User.findAll({
      where: {
        id: req.params.userId
      },
      attributes: ["firstName", "lastName", "id"],

      include: [
        {
          model: Post,
          include: [
            {
              model: Tag,
              attributes: ["TagName", "id"]
            }
          ]
        }
      ]
    });

    const pureCreatePost = JSON.parse(JSON.stringify(createPost));

    res.status(201).json({ pureCreatePost });
  } catch (err) {
    next(err);
  }
};

exports.getBySearch = async (req, res, next) => {
  try {
    const postName = req.query.postName || "";
    console.log("postName:", postName);

    let queryArray = [];
    // for 2 field search
    if (postName !== "") {
      queryArray.push({
        title: {
          [Op.like]: `%${postName}%`
        }
      });
    }
    console.log("queryArray:", queryArray);

    const postData = await Post.findAll({
      where: {
        title: {
          [Op.like]: `%${postName}%`
        }
      }
    });
    console.log("postData:", postData);

    if (postData.length > 0) {
      // for show how many quantity of this product
      quantity = await Post.count({ where: { [Op.and]: queryArray } });
    }
    const total = await Post.count({ where: { [Op.and]: queryArray } });

    res.json({ postData: postData, quantity, total });
  } catch (err) {
    next(err);
  }
};

exports.editPost = async (req, res, next) => {
  try {
    const { title, tagId, description } = req.body;
    const postId = req.params.postId;
    console.log("postId:", postId);

    console.log("title:", title);
    console.log("tagId:", tagId);
    console.log("description:", description);
    console.log("req.files:", req.files);

    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({ message: "Post image is required" });
    }
    const postImages = [];
    for (let i = 0; i < req.files.image.length; i++) {
      const image = await cloudinary.uploaPostImage(req.files.image[i].path);
      console.log("image:", image);
      postImages.push(image);
      console.log("Uploaded image:", image);
      fs.unlinkSync(req.files.image[i].path);
    }

    const editPost = {
      title: title,
      description: description,
      tagId: tagId,
      image: JSON.stringify(postImages)
    };
    // console.log("editComments:", editComments);

    const pureEditPost = JSON.parse(JSON.stringify(editPost));

    await Post.update(pureEditPost, {
      where: { id: postId }
    });

    res.status(201).json({ message: "Edit Completed!!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateStatusPostHidePost = async (req, res, next) => {
  try {
    console.log("req.params.postId", req.params.postId);

    const updateStatus = {
      status: HIDE_POST
    };

    const existingUpdateStatus = await Post.findOne({
      where: {
        id: req.params.postId,
        status: {
          [Op.not]: SHOW_POST
        }
      }
    });
    // console.log("existingUpdateStatus:", existingUpdateStatus);

    if (existingUpdateStatus && existingUpdateStatus.status === HIDE_POST) {
      createError("Already Hide Post", 400);
    }

    const pureUpdateStatus = JSON.parse(JSON.stringify(updateStatus));
    // console.log("pureUpdateStatus:", pureUpdateStatus);

    await Post.update(pureUpdateStatus, {
      where: { id: req.params.postId }
    });

    res.status(201).json({ message: "Update Status Completed!!" });
  } catch (err) {
    next(err);
  }
};

exports.updateStatusPostShowPost = async (req, res, next) => {
  try {
    console.log("req.params.postId", req.params.postId);

    const updateStatus = {
      status: SHOW_POST
    };

    const existingUpdateStatus = await Post.findOne({
      where: {
        id: req.params.postId,
        status: {
          [Op.not]: HIDE_POST
        }
      }
    });
    // console.log("existingUpdateStatus:", existingUpdateStatus);

    if (existingUpdateStatus && existingUpdateStatus.status === SHOW_POST) {
      createError("Already Show Post", 400);
    }

    const pureUpdateStatus = JSON.parse(JSON.stringify(updateStatus));
    // console.log("pureUpdateStatus:", pureUpdateStatus);

    await Post.update(pureUpdateStatus, {
      where: { id: req.params.postId }
    });

    res.status(201).json({ message: "Update Status Completed!!" });
  } catch (err) {
    next(err);
  }
};
