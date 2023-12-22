const { HIDE_POST, UNHIDE_POST } = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      title: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      image: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(HIDE_POST, UNHIDE_POST),
        allowNull: false,
        defaultValue: UNHIDE_POST
      }
    },
    { underscored: true }
  );

  Post.associate = db => {
    Post.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });

    Post.hasMany(db.Comment, {
      foreignKey: {
        name: "postId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });

    Post.hasMany(db.Like, {
      foreignKey: {
        name: "postId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });

    Post.belongsTo(db.Tag, {
      foreignKey: {
        name: "tagId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });
  };

  return Post;
};
