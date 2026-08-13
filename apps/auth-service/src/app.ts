import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "@nexus/errors";
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));
app.use(errorHandler);
app.use("/auth", authRoutes);
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});
app.get("/", (_, res) => {
    res.send("It works!");
});

export default app;
