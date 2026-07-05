// const { Sequelize } = require('sequelize');

// let isPostgresConnected = false;

// // Initialize Sequelize instance with environment variables
// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'haiderpay',
//   process.env.DB_USER || 'postgres',
//   process.env.DB_PASS || 'postgres',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: parseInt(process.env.DB_PORT || '5432', 10),
//     dialect: 'postgres',
//     logging: false, // Turn off SQL logs in console for cleanliness
//     dialectOptions: {
//       connectTimeout: 2000, // Connection timeout in milliseconds
//     },
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//   }
// );

// const connectDB = async () => {
//   try {
//     console.log(`Attempting to connect to PostgreSQL database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    
//     // Test the database connection
//     await sequelize.authenticate();
//     isPostgresConnected = true;
//     console.log('✅ PostgreSQL Connected successfully!');
    
//     // Sync models dynamically with the database schema
//     await sequelize.sync({ alter: true });
//     console.log('✅ PostgreSQL database tables synchronized.');
//   } catch (error) {
//     console.log(`❌ PostgreSQL Connection Failed: ${error.message}`);
//     console.log(`⚠️  FALLBACK ACTIVE: Running server in Local JSON/In-Memory database mode.`);
//     isPostgresConnected = false;
//   }
// };

// module.exports = {
//   sequelize,
//   connectDB,
//   isPostgresConnected: () => isPostgresConnected,
// };




const { Sequelize } = require('sequelize');

let isPostgresConnected = false;

// Use DATABASE_URL if available (Railway/production), otherwise fallback to individual vars (local dev)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        connectTimeout: 2000,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'haiderpay',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          connectTimeout: 2000,
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

const connectDB = async () => {
  try {
    console.log('Attempting to connect to PostgreSQL database...');
    
    await sequelize.authenticate();
    isPostgresConnected = true;
    console.log('✅ PostgreSQL Connected successfully!');
    
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL database tables synchronized.');
  } catch (error) {
    console.log(`❌ PostgreSQL Connection Failed: ${error.message}`);
    console.log(`⚠️  FALLBACK ACTIVE: Running server in Local JSON/In-Memory database mode.`);
    isPostgresConnected = false;
  }
};

module.exports = {
  sequelize,
  connectDB,
  isPostgresConnected: () => isPostgresConnected,
};