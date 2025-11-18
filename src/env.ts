import { config } from "dotenv";

config();

if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN.trim() == "") {
    console.error("DISCORD_TOKEN not set");
    process.exit();
}

if (!process.env.TARGET_CHANNEL || process.env.TARGET_CHANNEL.trim() == "") {
    console.error("TARGET_CHANNEL not set");
    process.exit();
}