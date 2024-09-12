const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return ebanco_api_shareinfo_company.init(sequelize, DataTypes);
};

class ebanco_api_shareinfo_company extends Sequelize.Model {
  toJSON() {
    return {
      ...this.get(),
      account_number: undefined,
      address: undefined,
      register_code: undefined,
      compay_name: undefined,
    };
  }
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        names: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        mobile: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        mail: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        compay_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        register_code: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "ebanco_api_shareinfo_company",
        schema: "public",
        timestamps: false,
      }
    );
    return ebanco_api_shareinfo_company;
  }
}
