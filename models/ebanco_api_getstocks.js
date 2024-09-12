const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return ebanco_api_getstocks.init(sequelize, DataTypes);
};

class ebanco_api_getstocks extends Sequelize.Model {
  toJSON() {
    return { ...this.get(), register_code: undefined };
  }
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          get() {
            return this.getDataValue("account_number");
          },
        },
        names: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        mail: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        mobile: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        company_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        register_code: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        holdings: {
          type: DataTypes.DOUBLE,
          allowNull: true,
          // get() {
          //   const number = this.getDataValue("holdings");
          //   return new Intl.NumberFormat("en-IN", {
          //     maximumSignificantDigits: 3,
          //   }).format(number);
          // },
        },
      },
      {
        sequelize,
        tableName: "ebanco_api_getstocks",
        schema: "public",
        timestamps: false,
      }
    );
    return ebanco_api_getstocks;
  }
}
