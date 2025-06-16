require('dotenv').config();
const { sequelize } = require('./models');
const logger = require('./config/logger');
const { PartnerUser, Partner } = require('./models');

async function syncDatabase() {
  try {
    // Test database connection first
    logger.info('Testing database connection...');
    await sequelize.authenticate();
    logger.info('Database connection successful');

    // Sync all models
    logger.info('Starting database synchronization...');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully');

    // Create default partner if it doesn't exist
    logger.info('Checking for default partner...');
    let partner = await Partner.findOne({ where: { orgName: 'Default Org' } });
    if (!partner) {
      logger.info('Creating default partner...');
      partner = await Partner.create({
        orgName: 'Default Org',
        systemName: 'default-system',
        nidUsername: 'default-nid-username',
        nidPassword: 'default-nid-password',
        isActive: true
      });
      logger.info('Default partner created successfully');
    } else {
      logger.info('Default partner already exists');
    }

    // Create default admin user if it doesn't exist
    logger.info('Checking for default admin user...');
    const adminExists = await PartnerUser.findOne({
      where: { email: 'admin@nid-integration.com' }
    });

    if (!adminExists) {
      logger.info('Creating default admin user...');
      await PartnerUser.create({
        email: 'admin@nid-integration.com',
        password: 'Admin@123', // plain password, will be hashed by model hook
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        permissions: ['*'], // Full access
        scopes: ['admin', 'partner', 'user'],
        partnerId: partner.id
      });
      logger.info('Default admin user created successfully');
    } else {
      logger.info('Default admin user already exists');
    }

    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database synchronization failed:', {
      error: error.message,
      code: error.original?.code,
      detail: error.original?.detail,
      hint: error.original?.hint
    });

    if (error.original?.code === '28P01') {
      logger.error('Authentication failed. Please check your database credentials in .env file');
      logger.error('Expected format: postgres://username:password@host:port/database');
    } else if (error.original?.code === '3D000') {
      logger.error('Database does not exist. Please create the database first');
    } else if (error.original?.code === 'ECONNREFUSED') {
      logger.error('Could not connect to database server. Please check if PostgreSQL is running');
    }

    process.exit(1);
  }
}

// Run the sync
syncDatabase(); 