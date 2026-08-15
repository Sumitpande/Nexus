import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { appRouter } from "./modules";
import cookieParser from "cookie-parser";
import { errorHandler, requestId } from "./common/middleware";

const app = express();
app.use(requestId)
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
app.use("/api", appRouter);
app.use(errorHandler);
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});
app.get("/", (_, res) => {
  res.send("It works!");
});

export default app;
