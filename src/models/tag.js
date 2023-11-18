module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    "Tag",
    {
      TagName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    { underscored: true }
  );

  Tag.associate = db => {
    Tag.belongsTo(db.Post, {
      foreignKey: {
        name: "PostId",
        allowNull: false
      },
      onDelete: "RESTRICT"
    });
  };

  return Tag;
};
