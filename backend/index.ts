import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { initializeSocket } from "./socket/socket";
import connectDB from "./config/db";


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

// Initialize socket connections
initializeSocket(server);

// Connect to database and start server
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