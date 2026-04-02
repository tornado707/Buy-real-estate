require('dotenv').config();
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';
const { connectToDatabase } = require('./db/connection');


app.use(cors({
  origin: 'http://localhost:4200',  // Angular frontend URL
  credentials: true                  // Allow ed cookies
}));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Implelemented a csrf protection after doing a scan with semgrep
app.use((req, res, next) => {
  //we 
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (!safeMethods.includes(req.method)) {
    if (!req.headers['x-requested-with']) {
      return res.status(403).json({
        success: false,
        message: 'Missing CSRF header'
      });
    }
  }
  next();
});

// Routes
const routes = require('./routes/index');

app.use('/api', routes);

const server = http.createServer(app);

async function startServer() {
  try {
    await connectToDatabase();
    
    server.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();
