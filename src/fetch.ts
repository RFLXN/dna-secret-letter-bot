import axios from "axios";
import { type Result } from "./util.js";

const ANNOUNCEMENT_LIST_URL = "https://gall.dcinside.com/mgallery/board/lists/?id=duetnightabyss&exception_mode=notice";

export async function fetchAnnouncementList(): Promise<Result<string>> {
    try {
        const res = await axios.get(ANNOUNCEMENT_LIST_URL);
        if (res.status !== 200) {
            return { success: false, error: new Error(res.statusText) };
        }
        return { success: true, data: res.data as string };
    } catch(e) {
        return { success: false, error: e as Error };
    }
}

export async function fetchLetterPost(url: string): Promise<Result<string>> {
        try {
        const res = await axios.get(url);
        if (res.status !== 200) {
            return { success: false, error: new Error(res.statusText) };
        }
        return { success: true, data: res.data as string };
    } catch(e) {
        return { success: false, error: e as Error };
    }
}

const ROOT_URL = "https://gall.dcinside.com";
export async function fetchImage(imageUrl: string): Promise<Result<Buffer>> {
    try {
        const res = await axios.get(imageUrl, {
            headers: {
                "Referer": ROOT_URL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            responseType: "arraybuffer",
        });
        if (res.status !== 200) {
            return { success: false, error: new Error(res.statusText) };
        }
        return { success: true, data: Buffer.from(res.data) };
    } catch(e) {
        return { success: false, error: e as Error };
    }
}