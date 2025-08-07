import { serve } from "bun";

serve({
  fetch(req) {
    const url = new URL(req.url);
    const target = url.searchParams.get("url");
    if (!target) {
      return new Response(JSON.stringify({ error: "Missing ?url=" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }
    return bypassHubCloud(target);
  },
  port: process.env.PORT || 3000,
});

async function bypassHubCloud(link: string): Promise<Response> {
  try {
    const res = await fetch(link, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await res.text();
    const idMatch = html.match(/name="key" value="([^"]+)"/);
    if (!idMatch) {
      return new Response(JSON.stringify({ error: "Key not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const postBody = new URLSearchParams();
    postBody.set("key", idMatch[1]);

    const postRes = await fetch(link, {
      method: "POST",
      body: postBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const postHTML = await postRes.text();
    const finalLinkMatch = postHTML.match(/<a[^>]+href="([^"]+)"[^>]*>Download Now<\/a>/);

    if (!finalLinkMatch) {
      return new Response(JSON.stringify({ error: "Download link not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ download: finalLinkMatch[1] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Something went wrong", details: err }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
