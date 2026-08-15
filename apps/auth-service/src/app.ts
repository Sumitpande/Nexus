import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "@nexus/errors";
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost"], // frontend + gateway
    credentials: true, // important for cookies
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/auth", authRoutes);
app.use(errorHandler);
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});
app.get("/", (_, res) => {
    res.send("It works!");
});

export default app;
