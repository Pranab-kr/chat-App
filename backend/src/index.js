import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./db/connection.js";
import { userAuthMiddleware } from "./middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(userAuthMiddleware);

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json("Server is running!");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
