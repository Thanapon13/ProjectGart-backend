const { Tag } = require("../models");

exports.getTag = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({});
    res.status(201).json({ tags });
  } catch (err) {
    next(err);
  }
};
