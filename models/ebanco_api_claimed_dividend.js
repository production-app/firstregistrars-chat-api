const Sequelize = require("sequelize");
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  return ebanco_api_claimed_dividend.init(sequelize, DataTypes);
};

class ebanco_api_claimed_dividend extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_no: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        name: {
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
        divrate: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        amount: {
          type: DataTypes.STRING,
          allowNull: true,
          get() {
            const currency = this.getDataValue("amount");
            return new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
            }).format(currency);
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
        divdate_payable: {
          type: DataTypes.DATE,
          allowNull: false,
          get() {
            const date = this.getDataValue("divdate_payable");
            return moment(date).format("LL");
          },
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
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "ebanco_api_claimed_dividend",
        schema: "public",
        timestamps: false,
      }
    );
    return ebanco_api_claimed_dividend;
  }
}
