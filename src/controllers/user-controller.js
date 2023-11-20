const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const createError = require("../utils/create-error");
const { User } = require("../models");

exports.updateProfileImage = async (req, res, next) => {
  try {
    let value;

    const profilePublicId = req.user.profileImage
      ? cloudinary.getPublicId(req.user.profileImage)
      : null;

    if (!req.files.profileImage) {
      createError("profile image is required");
    }

    if (req.files.profileImage) {
      console.log(req.files, "req.files userrr");
      const profileImage = await cloudinary.uploadProfile(
        req.files.profileImage[0].path,
        profilePublicId
      );
      value = { profileImage };
    }

    await User.update(value, { where: { id: req.user.id } });
    res.status(200).json(value);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profileImage) {
      fs.unlinkSync(req.files.profileImage[0].path);
    }
  }
};

// update user profile
exports.updateUserInfo = async (req, res, next) => {
  try {
    const value = req.body;
    console.log(req.body, "req.body");

    await User.update(value, { where: { id: req.user.id } });
    res.status(200).json(value);
  } catch (err) {
    next(err);
  }
};
