'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TokenCache extends Model {
    static associate(models) {
      // Define associations here
      TokenCache.belongsTo(models.Partner, {
        foreignKey: 'partnerId',
        as: 'partner'
      });
    }
  }

  TokenCache.init({
    partnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'partners',
        key: 'id'
      }
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TokenCache',
    tableName: 'token_cache',
    timestamps: true,
    indexes: [
      {
        fields: ['partnerId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  return TokenCache;
}; 
