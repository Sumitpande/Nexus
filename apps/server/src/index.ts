import http from "http";
import app from "./app";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed", err);
    process.exit(1);
  }
}

bootstrap();
