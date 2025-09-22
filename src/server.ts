import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());

// Allow requests from any origin
app.use(cors({
  origin: true, // allows all origins
  credentials: true
}));

app.use("/api/users", userRoutes);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`User service is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
  });
