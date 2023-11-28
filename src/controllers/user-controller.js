const fs = require("fs");
const { Op } = require("sequelize");
const cloudinary = require("../utils/cloudinary");
const createError = require("../utils/create-error");
const { User, Follow } = require("../models");
const {
  FOLLOW_ALREADYFOLLOW,
  FOLLOW_NOTFOLLOWING,
  STATUS_UNKNOWN,
  STATUS_ME
} = require("../config/constant");

exports.updateProfileImage = async (req, res, next) => {
  try {
    let value;

    console.log("file---------", req.files.profileImage);

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

exports.getUserInfoById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.userId
      },
      attributes: {
        exclude: ["password"]
      }
    });

    if (!user) {
      createError("user with this id is not found", 400);
    }

    const userFollows = await Follow.findAll({
      where: {
        status: FOLLOW_ALREADYFOLLOW,
        [Op.or]: [
          { requesterId: req.params.userId },
          { accepterId: req.params.userId }
        ]
      },
      include: [
        { model: User, as: "Requester", attributes: { exclude: ["password"] } },
        { model: User, as: "Accepter", attributes: { exclude: ["password"] } }
      ]
    });

    res.status(200).json({
      user,
      userFollows
    });
  } catch (err) {
    next(err);
  }
};
