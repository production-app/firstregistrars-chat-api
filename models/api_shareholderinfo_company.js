const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return api_shareholderinfo_company.init(sequelize, DataTypes);
};

class api_shareholderinfo_company extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        names: {
          type: DataTypes.STRING(397),
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING(357),
          allowNull: true,
        },
        bvn: {
          type: DataTypes.STRING(12),
          allowNull: true,
        },
        mobile: {
          type: DataTypes.STRING(25),
          allowNull: true,
        },
        mail: {
          type: DataTypes.STRING(40),
          allowNull: true,
        },
        Company_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        register_code: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        bankac: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        branch_code: {
          type: DataTypes.STRING(7),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "api_shareholderinfo_company",
        schema: "dbo",
        timestamps: false,
      }
    );
    return api_shareholderinfo_company;
  }
}
