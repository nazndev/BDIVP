const bcrypt = require('bcryptjs');
const hash = '$2b$10$IWVw2wysGvXECVxaa/gCveVy3nvOHkvYqLFYZjzwl0YAExE66fdRe';
bcrypt.compare('Admin@123', hash, (err, res) => {
  console.log('Password matches:', res);
});