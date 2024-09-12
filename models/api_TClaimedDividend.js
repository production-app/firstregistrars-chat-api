const Sequelize = require("sequelize");
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  return api_TClaimedDividend.init(sequelize, DataTypes);
};

class api_TClaimedDividend extends Sequelize.Model {
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
          get() {
            const currency = this.getDataValue("amount");
            return new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
            }).format(currency);
          },
        },
        divdate_payable: {
          type: DataTypes.DATE,
          allowNull: false,
          get() {
            const date = this.getDataValue("divdate_payable");
            return moment(date).format("LL");
          },
        },
        yrend: {
          type: DataTypes.DATE,
          allowNull: true,
          get() {
            const year = this.getDataValue("yrend");
            return new Date(year).getFullYear();
          },
        },
        paymentno: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        date_paid: {
          type: DataTypes.DATE,
          allowNull: true,
          get() {
            const date = this.getDataValue("date_paid");
            return moment(date).format("LL");
          },
        },
        company_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "api_TClaimedDividend",
        schema: "dbo",
        timestamps: false,
      }
    );
    return api_TClaimedDividend;
  }
}
