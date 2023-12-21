module.exports = (sequelize, DataTypes) => {
  const AdminHistoryRestore = sequelize.define(
    "AdminHistoryRestore",
    {
      titlePost: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      imagePost: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    { underscored: true }
  );

  AdminHistoryRestore.associate = db => {
    AdminHistoryRestore.belongsTo(db.User, {
      foreignKey: {
        name: "userId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });

    AdminHistoryRestore.belongsTo(db.Tag, {
      foreignKey: {
        name: "tagId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });
  };

  return AdminHistoryRestore;
};
