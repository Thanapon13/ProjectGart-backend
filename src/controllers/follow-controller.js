const { Follow } = require("../models");
const { Op } = require("sequelize");
const { FOLLOW_ALREADYFOLLOW, FOLLOW_DELETED } = require("../config/constant");
const createError = require("../utils/create-error");

exports.requestFollow = async (req, res, next) => {
  try {
    if (req.user.id === +req.params.userId) {
      createError("Cannot request to follow yourself", 400);
    }

    const existingFollow = await Follow.findOne({
      where: {
        requesterId: req.user.id,
        accepterId: req.params.userId,
        status: {
          [Op.not]: FOLLOW_DELETED
        }
      }
    });

    if (existingFollow && existingFollow.status === FOLLOW_ALREADYFOLLOW) {
      createError("Already following", 400);
    }

    const value = {
      requesterId: req.user.id,
      accepterId: req.params.userId,
      status: FOLLOW_ALREADYFOLLOW
    };

    const newFollow = await Follow.create(value);

    res.status(200).json({ newFollow });
  } catch (err) {
    next(err);
  }
};

exports.deleteFollow = async (req, res, next) => {
  try {
    console.log("UserLogin:", req.user.id);
    console.log("unfollowFollowId:", req.params.followId);

    const follow = await Follow.findOne({
      where: {
        accepterId: req.params.followId,
        [Op.or]: [
          // { requesterId: req.user.id },
          // { accepterId: req.params.followId } ,
          { requesterId: req.params.followId, accepterId: req.user.id },
          { requesterId: req.user.id, accepterId: req.params.followId }
        ],
        status: FOLLOW_ALREADYFOLLOW
      }
    });

    console.log("follow:", follow);

    if (!follow) {
      throw createError("You do not have a relationship with this follow", 400);
    }

    // Update only if the status is FOLLOW_ALREADYFOLLOW
    if (follow.status === FOLLOW_ALREADYFOLLOW) {
      const update = await follow.update({ status: FOLLOW_DELETED });
      console.log("update:", update);
    }

    res.status(204).json();
  } catch (err) {
    console.error("Error in deleteFollow:", err);
    next(err);
  }
};

exports.getCreateFollow = async (req, res, next) => {
  try {
    const createFollow = await Follow.findAll({});

    const pureCreateFollow = JSON.parse(JSON.stringify(createFollow));

    console.log("pureCreateFollow:", pureCreateFollow);

    res.status(201).json({ pureCreateFollow });
  } catch (err) {
    next(err);
  }
};
