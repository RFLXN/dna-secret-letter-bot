import "./env.js";
import cron from "node-cron";
import { initDiscordClient } from "./discord.js";
import { fetchAndFindLetter, fetchAndFindContents, createFullLetterUrl, extractPostId, fetchImages, sendMessage } from "./function.js";

(async () => {
    const discord = await initDiscordClient();
    if (!discord) return;

    console.log(`Logged in Discord as "${discord.user.displayName}" (${discord.user.id})`);

    let latestLetterId = -1;
    
    cron.schedule("*/5 * * * *", async () => {
        const letterPost = await fetchAndFindLetter();
        if (!letterPost) return;

        const letterUrl = createFullLetterUrl(letterPost.url);
        const id = extractPostId(letterUrl);

        console.log(`Letter announcement ID: ${id}`);

        if (id <= latestLetterId) {
            console.error(`ID is not newer than latest ID`);
            return;
        }

        latestLetterId = id;

        const contents = await fetchAndFindContents(letterUrl);
        if (!contents || contents.length < 1) return; 

        const images = await fetchImages(contents);
        if (!images) {
            return;
        };
        
        console.log("Send Message...");
        await sendMessage(discord, contents, images);
    });
})();