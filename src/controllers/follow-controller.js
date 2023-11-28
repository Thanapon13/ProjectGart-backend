const { Follow } = require("../models");
const { Op } = require("sequelize");
const { FOLLOW_ALREADYFOLLOW } = require("../config/constant");
const createError = require("../utils/create-error");

exports.requestFollow = async (req, res, next) => {
  try {
    if (req.user.id === +req.params.userId) {
      createError("cannot request yourself", 400);
    }

    // const existFollow = await Follow.findOne({
    //   where: {
    //     [Op.or]: [
    //       { requesterId: req.params.userId, accepterId: req.user.id },
    //       { requesterId: req.user.id, accepterId: req.params.userId }
    //     ]
    //   }
    // });

    // console.log("existFollow:", existFollow);

    // if (existFollow) {
    //   createError("already follow or pending", 400);
    // }

    const value = {
      requesterId: req.user.id,
      accepterId: req.params.userId,
      status: FOLLOW_ALREADYFOLLOW
    };
    console.log("value:", value);

    await Follow.create(value);

    res.status(200).json({ message: "success follow request" });
  } catch (err) {
    next(err);
  }
};

exports.deleteFollow = async (req, res, next) => {
  try {
    const totalDelete = await Follow.destroy({
      where: {
        [Op.or]: [
          { requesterId: req.params.followId, accepterId: req.user.id },
          { requesterId: req.user.id, accepterId: req.params.followId }
        ]
      }
    });

    if (totalDelete === 0) {
      createError("you do not have relationship with this follow", 400);
    }

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
