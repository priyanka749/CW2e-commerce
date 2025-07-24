const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
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
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
