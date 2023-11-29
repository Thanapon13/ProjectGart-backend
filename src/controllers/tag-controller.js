const { Tag } = require("../models");
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
    console.log("req.files?:",req.files?)
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
  try {
    // console.log("req.params:", req.params);

    const tag = await Tag.findOne({ where: { id: req.params.tagId } });

    if (!tag) {
      createError("this post was not found", 400);
    }

    await tag.destroy();
    res.status(204).json({ message: "Delete Complete!!" });
  } catch (err) {
    next(err);
  }
};
