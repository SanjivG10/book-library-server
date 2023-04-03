import request from "supertest";
import { app } from "./../app";
const fs = require("fs");

describe("POST /upload", () => {

    it("should upload a file successfully", async () => {
        const res = await request(app)
            .post("/upload")
            .attach("coverImage", "./hp.jpg");

        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual("File uploaded successfully");
        expect(fs.existsSync(res.body.file)).toBe(true);
    });

    it("should return an error if the file is not an image", async () => {
        const res = await request(app)
            .post("/upload")
            .attach("coverImage", "./package.json");

        expect(res.status).toBeGreaterThanOrEqual(400);

    });
});
