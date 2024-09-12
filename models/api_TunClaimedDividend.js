const Sequelize = require("sequelize");
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  return api_TunClaimedDividend.init(sequelize, DataTypes);
};

class api_TunClaimedDividend extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_no: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        Name: {
          type: DataTypes.STRING(397),
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
        divrate: {
          type: DataTypes.DECIMAL(19, 4),
          allowNull: true,
        },
        amount: {
          type: DataTypes.DECIMAL(19, 4),
          allowNull: true,
        },
        divdate_payable: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        yrend: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        paymentno: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        date_paid: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        company_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "api_TunClaimedDividend",
        schema: "dbo",
        timestamps: false,
      }
    );
    return api_TunClaimedDividend;
  }
}
