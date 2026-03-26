import request from "supertest";
import app from "../src/app.js";

describe("GET /api/search", () => {
    it("should return 400 if query is missing", async () => {
        const res = await request(app).get("/api/search");
        expect(res.statusCode).toBe(400);
    });

    it("should return 200 and array for valid query", async () => {
        const res = await request(app).get("/api/search?q=test");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 400 for input with HTML tags (XSS protection)", async () => {
        const res = await request(app).get("/api/search?q=<script>alert('XSS')</script>");
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/invalid/i);
    });

    it("should return 400 for input longer than 100 characters", async () => {
        const longQuery = "a".repeat(101);
        const res = await request(app).get(`/api/search?q=${longQuery}`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toMatch(/too long/i);
    });

    it("should return max 10 results (first page)", async () => {
        const res = await request(app).get("/api/search?q=test");

        expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it("each result should have correct structure", async () => {
        const res = await request(app).get("/api/search?q=test");

        if (res.body.length > 0) {
            const item = res.body[0];

            expect(item).toHaveProperty("title");
            expect(item).toHaveProperty("link");
            expect(item).toHaveProperty("snippet");

            expect(typeof item.title).toBe("string");
            expect(typeof item.link).toBe("string");
            expect(typeof item.snippet).toBe("string");
        }
    });
});
