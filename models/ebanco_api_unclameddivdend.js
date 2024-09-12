const Sequelize = require("sequelize");
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  return ebanco_api_unclameddivdend.init(sequelize, DataTypes);
};

class ebanco_api_unclameddivdend extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_no: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        Name: {
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
        date_paid: {
          type: DataTypes.DATE,
          allowNull: true,
          get() {
            const date = this.getDataValue("date_paid");
            return date ? moment(date).format("LL") : "null";
          },
        },
        paymentno: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        company_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "ebanco_api_unclameddivdend",
        schema: "public",
        timestamps: false,
      }
    );
    return ebanco_api_unclameddivdend;
  }
}
