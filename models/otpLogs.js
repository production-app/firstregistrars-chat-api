const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return otpLogs.init(sequelize, DataTypes);
}

class otpLogs extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'otpLogs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__otpLogs__3213E83F0558B046",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return otpLogs;
  }
}
