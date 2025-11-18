import * as cheerio from "cheerio";

export interface Announcement {
  title: string;
  url: string;
}

// XPath: /html/body/div[2]/div[3]/main/section[1]/article[2]/div[2]/table/tbody
const LIST_SELECTOR = "body > div:nth-of-type(2) > div:nth-of-type(3) > main > section:nth-of-type(1) > article:nth-of-type(2) > div:nth-of-type(2) > table > tbody";

export function parseAnnouncementList(html: string): Announcement[] {
  const $ = cheerio.load(html);
  const tbody = $(LIST_SELECTOR);

  const announcements: Announcement[] = [];

  tbody.find("tr.us-post").each((_, tr) => {
    const td = $(tr).find("td.gall_tit.ub-word");
    const anchor = td.find("a");
    const title = anchor.find("b").text().trim();
    const url = anchor.attr("href") || "";

    announcements.push({ title, url });
  });

  return announcements;
}

const LETTER_TITLE_REGEX = /.*[1-9][0-9]?시.*/;

export function findLetter(list: Announcement[]): Announcement | undefined {
  return list.find(a => LETTER_TITLE_REGEX.test(a.title));
}

export type TextContent = { type: "text"; value: string };
export type ImageContent = { type: "image"; src: string };
export type ContentItem = TextContent | ImageContent;

export function parseLetterPostContent(html: string): ContentItem[] {
  const $ = cheerio.load(html);
  const contentDiv = $(".write_div");
  const items: ContentItem[] = [];

  contentDiv.children().each((_, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();

    if (tagName === "p") {
      const text = $el.text().trim();
      if (text) {
        items.push({ type: "text", value: text });
      }
    } else if (tagName === "div") {
      const img = $el.find("img");
      if (img.length > 0) {
        const src = img.attr("src") || "";
        items.push({ type: "image", src });
      }
    }
  });

  return items;
}