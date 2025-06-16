'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class PartnerUser extends Model {
    static associate(models) {
      // Define associations here
      PartnerUser.belongsTo(models.Partner, {
        foreignKey: 'partnerId',
        as: 'partner'
      });
    }

    // Instance method to check if user has a specific permission
    hasPermission(permission) {
      if (this.permissions.includes('*')) return true;
      return this.permissions.includes(permission);
    }

    // Instance method to check if user has a specific scope
    hasScope(scope) {
      return this.scopes.includes(scope);
    }

    // Instance method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  PartnerUser.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    partnerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'partners',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'partner', 'user'),
      allowNull: false,
      defaultValue: 'user'
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isValidPermissions(value) {
          if (!Array.isArray(value)) {
            throw new Error('Permissions must be an array');
          }
          // Validate each permission is a string
          value.forEach(permission => {
            if (typeof permission !== 'string') {
              throw new Error('Each permission must be a string');
            }
          });
        }
      }
    },
    scopes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isValidScopes(value) {
          if (!Array.isArray(value)) {
            throw new Error('Scopes must be an array');
          }
          // Validate each scope is a string
          value.forEach(scope => {
            if (typeof scope !== 'string') {
              throw new Error('Each scope must be a string');
            }
          });
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'PartnerUser',
    tableName: 'partner_users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        // Set default permissions based on role
        if (!user.permissions) {
          switch (user.role) {
            case 'admin':
              user.permissions = ['*'];
              user.scopes = ['admin', 'partner', 'user'];
              break;
            case 'partner':
              user.permissions = ['read:own', 'write:own'];
              user.scopes = ['partner', 'user'];
              break;
            case 'user':
              user.permissions = ['read:own'];
              user.scopes = ['user'];
              break;
          }
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return PartnerUser;
}; 
