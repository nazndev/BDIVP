const { Client } = require('pg');

// Print the raw DB_URL and its length for debugging
console.log('DB_URL from process.env:', JSON.stringify(process.env.DB_URL));
console.log('DB_URL length:', process.env.DB_URL.length);

const client = new Client({
  connectionString: process.env.DB_URL
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.end();
  })
  .catch(err => {
    console.error('Connection error:', err);
  });