import { serve } from "bun";
import { bypassHubCloud } from "./api/bypass";

serve({
  port: process.env.PORT || 3000,
  fetch: async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/api/bypass") {
      const target = url.searchParams.get("url");
      if (!target) {
        return new Response(
          JSON.stringify({ status: "error", message: "Missing url param" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await bypassHubCloud(target);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});
