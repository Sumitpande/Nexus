import app from "./app";
import { connectPostgres } from "@nexus/db";

const PORT = process.env.PORT || 4002;

async function start() {
    try {
        await connectPostgres();
        console.info("➡️  PostgreSQL connected");

        app.listen(PORT, () => {
            console.info(`➡️  User Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌  Failed to start user-service:", error);
        process.exit(1);
    }
}

start();
