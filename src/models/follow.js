const {
  FOLLOW_ALREADYFOLLOW,
  FOLLOW_NOTFOLLOWING,
  FOLLOW_DELETED
} = require("../config/constant");

module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    "Follow",
    {
      status: {
        type: DataTypes.ENUM(
          FOLLOW_NOTFOLLOWING,
          FOLLOW_ALREADYFOLLOW,
          FOLLOW_DELETED
        ),
        allowNull: false,
        defaultValue: FOLLOW_NOTFOLLOWING
      }
    },
    { underscored: true }
  );

  Follow.associate = db => {
    Follow.belongsTo(db.User, {
      as: "Requester",
      foreignKey: {
        name: "requesterId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });

    Follow.belongsTo(db.User, {
      as: "Accepter",
      foreignKey: {
        name: "accepterId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });
  };

  return Follow;
};
