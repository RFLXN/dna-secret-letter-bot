import { Client, IntentsBitField, REST } from "discord.js";

export async function initDiscordClient() {
    const client = new Client({
        intents: [
            IntentsBitField.Flags.GuildMessages
        ]
    });

    return new Promise<Client<true>>((resolve, reject) => {
        client.once("clientReady", (c) => resolve(c));
        client.once("error", (e) => reject(e));

        client.login(process.env.DISCORD_TOKEN);
    });
}