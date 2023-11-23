const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const { Post, User, Tag } = require("../models");

exports.createPost = async (req, res, next) => {
  try {
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

exports.getCreatePost = async (req, res, next) => {
  try {
    const createPost = await Post.findAll({
      attributes: ["id", "title", "description", "image"],
      include: [
        { model: Tag, attributes: ["TagName"] },
        { model: User, attributes: ["firstName", "lastName", "id", "email"] }
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