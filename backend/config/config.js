require('dotenv').config();
const logger = require('./logger');

// Validate required environment variables
const requiredEnvVars = ['DB_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Log database configuration (without sensitive data)
const dbUrl = process.env.DB_URL;
const sslEnabled = process.env.SSL_ENABLED === 'true';
const sslRejectUnauthorized = process.env.SSL_REJECT_UNAUTHORIZED === 'true';

const dbConfig = {
  development: {
    use_env_variable: 'DB_URL',
    dialect: 'postgres',
    dialectOptions: sslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: sslRejectUnauthorized
          }
        }
      : {},
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    use_env_variable: 'DB_URL',
    dialect: 'postgres',
    dialectOptions: sslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: sslRejectUnauthorized
          }
        }
      : {},
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    use_env_variable: 'DB_URL',
    dialect: 'postgres',
    dialectOptions: sslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: sslRejectUnauthorized
          }
        }
      : {},
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Log configuration details
logger.info('Database configuration:', {
  environment: process.env.NODE_ENV || 'development',
  dialect: 'postgres',
  sslEnabled,
  sslRejectUnauthorized
});

module.exports = dbConfig; 