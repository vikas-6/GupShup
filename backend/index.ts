import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "mongoose";
import authRoutes from "./routes/auth.routes";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 9000;

const server = http.createServer(app);

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI || "");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

connectDB()
  .then(() => {
    console.log('Database connected');
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(
      "Failed to start the server due to database connection error: ",
      error
    );
  });
