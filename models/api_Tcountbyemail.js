const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return api_Tcountbyemail.init(sequelize, DataTypes);
};

class api_Tcountbyemail extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        count: {
          type: DataTypes.INTEGER,
          allowNull: true,
          primaryKey: true,
        },
        mail: {
          type: DataTypes.STRING(40),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "api_Tcountbyemail",
        schema: "dbo",
        timestamps: false,
      }
    );
    return api_Tcountbyemail;
  }
}
