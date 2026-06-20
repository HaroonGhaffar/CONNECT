require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
connectDB();
const app = express();



app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Connect API Running...");
});




const PORT = process.env.PORT || 5000;

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});