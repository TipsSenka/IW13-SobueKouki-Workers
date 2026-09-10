const json = (data, status = 200, origin = "*") => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=UTF-8",
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type"
  }
});

const errorResponse = (message, status, origin) => json({ error: message }, status, origin);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestOrigin = request.headers.get("Origin");
    const configuredOrigin = env.ALLOWED_ORIGIN || "*";
    const origin = configuredOrigin === "*" ? "*" : configuredOrigin;

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type"
    } });
    if (configuredOrigin !== "*" && requestOrigin && requestOrigin !== configuredOrigin) {
      return errorResponse("Origin is not allowed", 403, origin);
    }
    if (request.method !== "GET") return errorResponse("Method Not Allowed", 405, origin);

    if (url.pathname === "/api") {
      return json({ status: "running", service: "senka-api", endpoints: ["/api/course", "/api/hello?name=山田", "/api/fortune", "/api/events"] }, 200, origin);
    }
    if (url.pathname === "/api/course") {
      return json({ course: "IT", message: "Hello Workers", description: "Web技術とプログラミングを学ぶ学科です。" }, 200, origin);
    }
    if (url.pathname === "/api/hello") {
      const name = url.searchParams.get("name")?.trim();
      if (!name) return errorResponse("nameを入力してください", 400, origin);
      if (name.length > 40) return errorResponse("nameは40文字以内で入力してください", 400, origin);
      return json({ message: `こんにちは、${name}さん！`, name }, 200, origin);
    }
    if (url.pathname === "/api/fortune") {
      const fortunes = ["大吉", "中吉", "小吉", "吉"];
      return json({ fortune: fortunes[Math.floor(Math.random() * fortunes.length)], message: "今日も一歩ずつ進みましょう。" }, 200, origin);
    }
    if (url.pathname === "/api/events") {
      return json({ events: [
        { title: "Workers API入門", date: "2026-09-18", place: "オンライン" },
        { title: "Webアプリ制作相談会", date: "2026-09-25", place: "HAL教室" }
      ] }, 200, origin);
    }
    return errorResponse("指定されたAPIは見つかりません", 404, origin);
  }
};