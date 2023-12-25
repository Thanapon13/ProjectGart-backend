const fs = require("fs");
const { Op } = require("sequelize");
const cloudinary = require("../utils/cloudinary");
const createError = require("../utils/create-error");
const { User, Post, Comment, Like, Follow, sequelize } = require("../models");
const bcrypt = require("bcrypt");
const {
  FOLLOW_ALREADYFOLLOW,
  BAN_USER,
  SHOW_USER
} = require("../config/constant");

exports.updateProfileImage = async (req, res, next) => {
  try {
    let value;

    console.log("req.files.profileImage:", req.files.profileImage);

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

exports.updatecoverImage = async (req, res, next) => {
  try {
    let value;

    // console.log("req.files.coverImage:", req.files.coverImage);
    // console.log(" req.user:", req.user);

    const { coverImage } = req.user;
    // console.log("coverImage:", coverImage);

    const coverPublicId = coverImage
      ? cloudinary.getPublicId(coverImage)
      : null;

    if (!req.files.coverImage) {
      createError("coverImage is required");
    }

    if (req.files.coverImage) {
      // console.log("req.files.coverImage:", req.files.coverImage);
      const coverImage = await cloudinary.uploadProfile(
        req.files.coverImage[0].path,
        coverPublicId
      );
      value = { coverImage };
      console.log("value:", value);
    }

    await User.update(value, { where: { id: req.user.id } });
    res.status(200).json(value);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.coverImage) {
      fs.unlinkSync(req.files.coverImage[0].path);
    }
  }
};

// update user profile
exports.updateUserInfo = async (req, res, next) => {
  try {
    const value = req.body;
    console.log("req.body:", req.body);

    await User.update(value, { where: { id: req.user.id } });
    res.status(200).json(value);
  } catch (err) {
    next(err);
  }
};

exports.updateUserInfoPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log("oldPassword:", oldPassword);
    console.log("newPassword:", newPassword);
    console.log("confirmPassword:", confirmPassword);

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    console.log("user:", user);

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Compare the old password with the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    // Hash the new password before updating the user's password in the database
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password with the new hashed password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
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

    const Posts = await Post.findAll({});

    res.status(200).json({
      user,
      userFollows,
      Posts
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserData = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "lastLoggedIn",
        "profileImage"
      ],
      include: [
        {
          model: Follow,
          as: "Requester",
          attributes: ["requesterId", "accepterId", "status"],
          include: [
            {
              model: User,
              as: "Requester",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "mobile",
                "profileImage",
                "coverImage",
                "isAdmin",
                "lastLoggedIn",
                "createdAt",
                "updatedAt"
              ]
            }
          ]
        },
        {
          model: Follow,
          as: "Accepter",
          attributes: ["accepterId", "requesterId", "status"],
          include: [
            {
              model: User,
              as: "Accepter",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "mobile",
                "profileImage",
                "coverImage",
                "isAdmin",
                "lastLoggedIn",
                "createdAt",
                "updatedAt"
              ]
            }
          ]
        },
        {
          model: Post,
          attributes: ["id"],
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName"]
            }
          ]
        }
      ]
    });

    const pureUsersData = JSON.parse(JSON.stringify(users));

    res.status(200).json({ pureUsersData });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.params.userId;
    console.log("userId----", userId);

    // Delete associated records in the likes table
    await Like.destroy({
      where: {
        userId
      },
      transaction
    });

    // Find all posts associated with the user
    const userPosts = await Post.findAll({
      where: {
        userId
      },
      attributes: ["id"]
    });

    const postIds = userPosts.map(post => post.id);

    // Delete associated records in the likes table for each post
    await Like.destroy({
      where: {
        postId: {
          [Op.in]: postIds
        }
      },
      transaction
    });

    // Delete associated records in the comments table for each post
    await Comment.destroy({
      where: {
        postId: {
          [Op.in]: postIds
        }
      },
      transaction
    });

    // Delete associated records in other tables
    await Post.destroy({
      where: {
        userId
      },
      transaction
    });

    await Follow.destroy({
      where: {
        [Op.or]: [{ requesterId: userId }, { accepterId: userId }]
      },
      transaction
    });

    // Delete the user
    await User.destroy({
      where: {
        id: userId
      },
      transaction
    });

    await transaction.commit();
    res.status(200).json({ message: "Delete success" });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.updateStatusBanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    console.log("userId:", userId);

    const adminUserId = req.user.id;
    console.log("adminUserId", adminUserId);

    const adminData = await User.findOne({
      where: {
        id: adminUserId
      },
      attributes: ["id", "firstName", "lastName", "isAdmin", "lastLoggedIn"]
    });
    // console.log("adminData:", adminData);

    const adminLastLoggedIn = adminData.lastLoggedIn;
    // const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    // const oneDayInMilliseconds = 60 * 1000;
    const oneDayInMilliseconds = 20 * 1000;

    const endBanDate = new Date(
      adminLastLoggedIn.getTime() + oneDayInMilliseconds
    );
    console.log("adminLastLoggedIn:", adminLastLoggedIn.toLocaleString());
    console.log("endBanDate:", endBanDate.toLocaleString());

    console.log("oneDayInMilliseconds:", oneDayInMilliseconds);

    const valueUpdate = {
      status: BAN_USER,
      startBanDate: adminData.lastLoggedIn,
      endBanDate: endBanDate
    };
    console.log("valueUpdate:", valueUpdate);

    const existingUpdateStatus = await User.findOne({
      where: {
        id: req.params.userId,
        status: {
          [Op.not]: SHOW_USER
        }
      }
    });
    // console.log("existingUpdateStatus:", existingUpdateStatus);

    if (existingUpdateStatus && existingUpdateStatus.status === BAN_USER) {
      createError("Already Ban User", 400);
    }

    const pureUpdate = JSON.parse(JSON.stringify(valueUpdate));
    // console.log("pureUpdateStatus:", pureUpdateStatus);

    await User.update(pureUpdate, {
      where: { id: userId }
    });

    res.status(201).json({ message: "Update Status Completed!!" });
  } catch (err) {
    next(err);
  }
};

exports.updateStatusShowUser = async (req, res, next) => {
  try {
    const { userId, countdown } = req.params;
    console.log("userId:", userId);
    console.log("countdown:", countdown);

    const updateStatus = {
      status: SHOW_USER
    };

    const existingUpdateStatus = await User.findOne({
      where: {
        id: userId,
        status: {
          [Op.not]: BAN_USER
        }
      }
    });

    if (existingUpdateStatus && existingUpdateStatus.status === SHOW_USER) {
      createError("Already Show User", 400);
    }

    const pureUpdateStatus = JSON.parse(JSON.stringify(updateStatus));

    if (parseInt(countdown) === 0) {
      await User.update(pureUpdateStatus, { where: { id: userId } });
      res.status(201).json({ message: "Update Status Completed!!" });
    } else {
      res
        .status(200)
        .json({ message: "Countdown is not zero, update skipped." });
    }

    res.status(201).json({ message: "Update Status Completed!!" });
  } catch (err) {
    next(err);
  }
};
