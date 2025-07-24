const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const https = require('https');
const fs = require('fs');
const connectDB = require("./config/db");
const session = require('express-session');

// Check if HTTPS certificate files exist
let httpsEnabled = false;
let httpsOptions = null;

try {
  const keyPath = './cert/localhost-key.pem';
  const certPath = './cert/localhost.pem';
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    httpsEnabled = true;
    console.log('🔐 HTTPS certificate found. HTTPS will be enabled.');
  } else {
    console.warn('⚠️  HTTPS certificate not found. Running in HTTP-only mode.');
    console.warn('   To enable HTTPS, run: npm run generate-cert');
  }
} catch (err) {
  console.warn('⚠️  Error checking HTTPS certificates:', err.message);
  console.warn('   Running in HTTP-only mode.');
}
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoute');
const cartRoutes = require('./routes/cartRoutes');
const chatRoute = require('./routes/chatRoute');
const Favorite = require('./models/fav'); // Import Favorite model
const Payment = require('./models/payment');
const locationRoute = require('./routes/locationRoute'); 
const saleRoutes = require('./routes/salesRoute'); 
const reviewRoute = require('./routes/reviewRoute'); // Import Review routes
// Import Sale routes
 // Import Sale routes
// const tryonRoute = require('./routes/tryonRoute'); // Import Tryon route

// const Location = require('./models/location'); // Import Location model

// const khaltiRoute = require('./routes/khaltiRoute');





dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Session middleware
app.use(session({
  secret: 'yourSecretKey', // Change this to a strong secret in production!
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS only
}));

// Category routes for CRUD operations

app.use('/api/categories', categoryRoutes);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use('/api', require('./routes/contactRoute'));
app.use('/api/products', productRoutes); 
app.use('/api/cart', cartRoutes);// ✅ Product routes
app.use('/api/chat', chatRoute); // ✅ Chat route
app.use('/api/favorites', require('./routes/favRoute'));
// app.use('/api/payment', khaltiRoute);
app.use('/api/payments', require('./routes/paymentRoutes')); // ✅ Payment routes
// app.use('/api/locations', require('./routes/locationRoute')); // ✅ Location routes

app.use('/api/location', locationRoute);
app.use('/api/sales', saleRoutes); // ✅ Sale routes
// app.use('/api/tryon', tryonRoute); // ✅ Tryon routes
// ✅ Sale routes
app.use('/api/reviews', reviewRoute); // ✅ Review routes

const PORT = 3000;
const HTTPS_PORT = 3000; // Default HTTPS port

// For development with self-signed certificate
// Start HTTPS server if certificates are available
if (httpsEnabled && httpsOptions) {
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🚀 HTTPS Server running at https://localhost:${HTTPS_PORT}`);
  });
}

// Always start HTTP server
app.listen(PORT, () => {
  // console.log(`🚀 Server running at http://localhost:${PORT}`);
  if (httpsEnabled) {
    console.log(`   HTTPS available at https://localhost:${HTTPS_PORT}`);
  } else {
    console.log('   HTTPS not configured. Run `npm run generate-cert` to enable HTTPS.');
  }
});
