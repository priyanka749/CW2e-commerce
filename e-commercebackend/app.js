const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const https = require('https');
const fs = require('fs');

const connectDB = require("./config/db");
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');


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
    console.log(' HTTPS certificate found. HTTPS will be enabled.');
  } else {
    console.warn('  HTTPS certificate not found. Running in HTTP-only mode.');
    console.warn('   To enable HTTPS, run: npm run generate-cert');
  }
} catch (err) {
  console.warn('  Error checking HTTPS certificates:', err.message);
  console.warn('   Running in HTTP-only mode.');
}
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoute');
const cartRoutes = require('./routes/cartRoutes');
const chatRoute = require('./routes/chatRoute');
const Favorite = require('./models/fav'); 
const Payment = require('./models/payment');
const locationRoute = require('./routes/locationRoute'); 
const saleRoutes = require('./routes/salesRoute'); 
const reviewRoute = require('./routes/reviewRoute'); 




dotenv.config();
connectDB();


const app = express();


app.enable('trust proxy'); 
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }
  res.redirect('https://' + req.headers.host + req.url);
});

const corsOptions = {
  origin: ["http://localhost:5173", "https://localhost:5173",
    "https://192.168.10.103:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "x-csrf-token", "csrf-token", "XSRF-TOKEN"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet()); 

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'public/uploads')));

app.use(cookieParser());

app.use(session({
  secret: 'yourSecretKey', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, 
    sameSite: 'none', 
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

  }
}));



app.get('/api/csrf-token', csrf({ cookie: true }), (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use((req, res, next) => {

  if (req.path.startsWith('/api/payments/khalti/')) {
    return next();
  }

  csrf({ cookie: true })(req, res, next);
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  next(err);
});



app.use('/api/categories', categoryRoutes);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use('/api', require('./routes/contactRoute'));
app.use('/api/products', productRoutes); 
app.use('/api/cart', cartRoutes);// ✅ Product routes
app.use('/api/chat', chatRoute); // ✅ Chat route
app.use('/api/favorites', require('./routes/favRoute'));
// app.use('/api/payment', khaltiRoute);
app.use('/api/payments', require('./routes/paymentRoutes')); 
// app.use('/api/locations', require('./routes/locationRoute')); 

app.use('/api/location', locationRoute);
app.use('/api/sales', saleRoutes); 
// app.use('/api/tryon', tryonRoute); 
// ✅ Sale routes
app.use('/api/reviews', reviewRoute); 

app.get('/', (req, res) => {
  res.send('API Server is running!');
});

const PORT = 3000;
const HTTPS_PORT = 3000; 


if (httpsEnabled && httpsOptions) {
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🚀 HTTPS Server running at https://localhost:${HTTPS_PORT}`);
  });
}

app.listen(PORT, () => {
 
  if (httpsEnabled) {
    console.log(`   HTTPS available at https://localhost:${HTTPS_PORT}`);
  } else {
    console.log('   HTTPS not configured. Run `npm run generate-cert` to enable HTTPS.');
  }
  
});

// if (httpsEnabled && httpsOptions) {
//   https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
//     console.log(`🚀 HTTPS Server running at https://0.0.0.0:${HTTPS_PORT}`);
//   });
// }

// // If you want to also run HTTP (optional):
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 HTTP Server running at http://0.0.0.0:${PORT}`);
// });