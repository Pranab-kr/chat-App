import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./db/connection.js";
import { userAuthMiddleware } from "./middlewares/auth.middleware.js";
import messageRouter from './routes/message.routes.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
import { app, server } from "./utils/socket.js";
import path from "path";

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(userAuthMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../frontend/dist')))

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

app.get("/", (req, res) => {
  res.json("Server is running!");
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
