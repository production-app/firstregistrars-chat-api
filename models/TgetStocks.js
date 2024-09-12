const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return TgetStocks.init(sequelize, DataTypes);
};

class TgetStocks extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        account_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        names: {
          type: DataTypes.STRING(397),
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING(357),
          allowNull: true,
        },
        mail: {
          type: DataTypes.STRING(40),
          allowNull: true,
        },
        mobile: {
          type: DataTypes.STRING(25),
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
        Holdings: {
          type: DataTypes.FLOAT,
          allowNull: true,
          get() {
            const number = this.getDataValue("Holdings");
            return new Intl.NumberFormat("en-IN", {
              maximumSignificantDigits: 3,
            }).format(number);
          },
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
        tableName: "TgetStocks",
        schema: "dbo",
        timestamps: false,
      }
    );
    return TgetStocks;
  }
}
