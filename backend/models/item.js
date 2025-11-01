'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Item.init({
    user_id: DataTypes.BIGINT,
    category_id: DataTypes.BIGINT,
    title: DataTypes.STRING,
    condition: DataTypes.STRING,
    available_from: DataTypes.DATE,
    available_to: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};