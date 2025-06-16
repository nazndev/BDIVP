'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Partner extends Model {
    static associate(models) {
      // Define associations here
      Partner.hasMany(models.PartnerUser, {
        foreignKey: 'partnerId',
        as: 'users'
      });
      Partner.hasOne(models.TokenCache, {
        foreignKey: 'partnerId',
        as: 'tokenCache'
      });
      Partner.hasMany(models.AuditLog, {
        foreignKey: 'partnerId',
        as: 'auditLogs'
      });
    }
  }

  Partner.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orgName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    systemName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nidUsername: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nidPassword: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Partner',
    tableName: 'partners',
    timestamps: true
  });

  return Partner;
}; 
