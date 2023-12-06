const { Tag, Post, sequelize } = require("../models");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const { validateCreateTag } = require("../valedators/createTga-validators");

exports.getTag = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({});
    res.status(201).json({ tags });
  } catch (err) {
    next(err);
  }
};

exports.createTag = async (req, res, next) => {
  try {
    const value = validateCreateTag({
      TagName: req.body.TagName,
      image: req.files?.image[0]?.path
    });

    console.log("value:", value);

    if (value.image) {
      value.image = await cloudinary.uploaTagImage(value.image);
    }

    const tag = await Tag.create(value);
    res.status(201).json({ tag });
  } catch (err) {
    next(err);
  } finally {
    if (req.files) {
      fs.unlinkSync(req.files?.image[0]?.path);
    }
  }
};

exports.deleteTag = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    console.log("req.params.tagId:", req.params.tagId);
    // Find the tag
    const tag = await Tag.findOne({
      where: { id: req.params.tagId },
      transaction
    });

    if (!tag) {
      createError("This tag was not found", 400);
    }

    // Find all posts associated with the tag
    const posts = await Post.findAll({
      where: { tagId: req.params.tagId },
      transaction
    });

    // Delete each post
    for (const post of posts) {
      await post.destroy({ transaction });
    }

    // Finally, delete the tag
    await tag.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(204).json({ message: "Delete Complete!!" });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};
