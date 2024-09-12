var DataTypes = require("sequelize").DataTypes;
var _T_shold = require("./T_shold");

function initModels(sequelize) {
  var T_shold = _T_shold(sequelize, DataTypes);

  return {
    T_shold,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
