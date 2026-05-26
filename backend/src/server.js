const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: "https://bajaj-test-iota-ten.vercel.app",
  credentials: true
}));

const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g., failed DB connection strings)
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  // Gracefully close server and exit
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions (e.g., coding syntax errors at runtime)
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
