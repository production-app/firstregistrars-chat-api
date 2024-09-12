const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return api_Tcountbyphone.init(sequelize, DataTypes);
};

class api_Tcountbyphone extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        count: {
          type: DataTypes.INTEGER,
          allowNull: true,
          primaryKey: true,
        },
        mobile: {
          type: DataTypes.STRING(25),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "api_Tcountbyphone",
        schema: "dbo",
        timestamps: false,
      }
    );
    return api_Tcountbyphone;
  }
}
