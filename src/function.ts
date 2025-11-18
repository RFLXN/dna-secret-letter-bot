import { Client, TextChannel } from "discord.js";
import { fetchAnnouncementList, fetchImage, fetchLetterPost } from "./fetch.js";
import { parseAnnouncementList, findLetter, type Announcement, parseLetterPostContent, type ContentItem, ImageContent } from "./parse.js";
import { stat, mkdir, writeFile } from "fs/promises";
import { resolve } from "path";

export async function fetchAndFindLetter(): Promise<Announcement | undefined> {
    console.log("Fetching announcement List...");
    const listRes = await fetchAnnouncementList();
    if (!listRes.success) {
        console.error("Failed to fetching announcement list!");
        console.error(listRes.error);
        return;
    }

    const list = parseAnnouncementList(listRes.data);
    console.log("Fetched announcement list:");
    console.log(list);

    const target = findLetter(list);
    if (!target) {
        console.error("Cannot find letter announcement...");
        return;
    }
    console.log("Letter announcement found!");
    console.log(target);

    return target;
}

const ROOT_URL = "https://gall.dcinside.com";
export function createFullLetterUrl(url: string) {
    return ROOT_URL + url;
}

export async function fetchAndFindContents(url: string): Promise<ContentItem[] | undefined> {
    console.log("Fetching letter announcement contents...");
    const letterRes = await fetchLetterPost(url);
    if (!letterRes.success) {
        console.error("Failed to fetching announcement contents!");
        console.error(letterRes.error);
        return;
    }

    const contents = parseLetterPostContent(letterRes.data);
    if (!contents || contents.length < 1) {
        console.error("Cannot find contents...");
        return;
    }
    console.log("Letter announcement contents:")
    console.log(contents);
    return contents;
}

export function extractPostId(url: string) {
    const u = new URL(url);
    return Number(u.searchParams.get("no"));
}

const TMP_IMG_DIR = "./tmp-imgs";

async function createIfTmpNot() {
    try {
        await stat(TMP_IMG_DIR);
    } catch {
        await mkdir(TMP_IMG_DIR, { recursive: true });
    }
}

export async function fetchImages(images: ContentItem[]): Promise<Buffer[] | undefined> {
    const fetchedImageBuffers: Buffer[] = [];

    for (const content of images) {
        if (content.type !== "image") continue;

        console.log(`Fetching image from: ${content.src}`);
        const imgRes = await fetchImage(content.src);
        if (!imgRes.success) {
            console.error("Failed to fetch image...");
            console.error(imgRes.error);
            return;
        }

        fetchedImageBuffers.push(imgRes.data);
    }

    return fetchedImageBuffers;
}

export async function sendMessage(client: Client<true>, contents: ContentItem[], images: Buffer[]) {
    console.log(`Fetching channel... (Channel ID: ${process.env.TARGET_CHANNEL})`);
    const channel = await client.channels.fetch(process.env.TARGET_CHANNEL as string);

    if (!channel) {
        console.error("Cannot fetch channel...");
        return;
    }

    if (!channel.isTextBased()) {
        console.error("Channel is not text-based...");
        return;
    }

    const c = channel as TextChannel;

    console.log(`Channel fetched: #${c.name}`);

    console.log(`Send message to #${c.name}...`);

    const content = contents.filter(c => c.type === "text").map(c => c.value).join("\n").trim();
    await (channel as TextChannel).send({
        content: content == "" ? undefined : content,
        files: images
    });
    console.log("Message sent!");
}