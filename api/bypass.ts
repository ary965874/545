import axios from "axios";
import * as cheerio from "cheerio";

export async function bypassHubCloud(url: string) {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90.0.4430.212 Safari/537.36",
    };

    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);

    const form = $("form").first();
    const action = form.attr("action");
    if (!action) throw new Error("Download form not found");

    const token = form.find('input[name="token"]').attr("value");
    if (!token) throw new Error("Token input missing");

    const finalUrl = new URL(action, url).toString();

    const postRes = await axios.post(
      finalUrl,
      new URLSearchParams({ token }),
      { headers }
    );

    const $$ = cheerio.load(postRes.data);
    const result = $$("a#download").attr("href");

    if (!result) throw new Error("Final download link not found");

    return { status: "success", download: result };
  } catch (err: any) {
    return { status: "error", message: err.message };
  }
}
