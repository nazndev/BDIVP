'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      // Define associations here
      AuditLog.belongsTo(models.Partner, {
        foreignKey: 'partnerId',
        as: 'partner'
      });
    }
  }

  AuditLog.init({
    partnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'partners',
        key: 'id'
      }
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    requestBody: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    responseBody: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    matchedFields: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    requesterEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    requesterRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nidFieldsUsed: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    indexes: [
      {
        fields: ['partnerId']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['endpoint']
      }
    ]
  });

  return AuditLog;
}; 
