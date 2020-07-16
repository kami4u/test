import app from "./app";
import supertest from "supertest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { gas, internal } from "./mockData/response";

const request = supertest(app);
const mock = new MockAdapter(axios);

describe("Provider", () => {
  it("Should give status 404 and error 'Payload is not right need to have name and callbackUrl'", async () => {
    const res = await request.post("/api/webhook");
    expect(res.status).toBe(404);
    expect(res.text).toBe("Payload is not right need to have name and callbackUrl");
  });

  it("Should give status 500 and error 'Provider Api is Failing with message #fail'", async () => {
    mock.onGet("http://127.0.0.1:3000/providers/gas").reply(500, "#fail");
    const res = await request.post("/api/webhook").send({ name: "gas", callbackUrl: "http://localhost:3100/api/data" });
    expect(res.status).toBe(200);
    expect(res.body.errors[0].statusCode).toBe(500);
    expect(res.body.errors[0].message).toBe("Provider Api is Failing with message #fail");
  });

  it("Should give status 404 and error 'Provider asd Does not exist'", async () => {
    mock.onGet("http://127.0.0.1:3000/providers/asd").reply(404, "#fail");
    const res = await request.post("/api/webhook").send({ name: "asd", callbackUrl: "http://localhost:3100/api/data" });
    expect(res.status).toBe(200);
    expect(res.body.errors[0].statusCode).toBe(404);
    expect(res.body.errors[0].message).toBe("Provider asd Does not exist");
  });

  it("Should give status 200 with the data", async () => {
    mock.onGet("http://127.0.0.1:3000/providers/gas").reply(200, gas);
    mock.onPost("http://localhost:3100/api/data").reply(200);
    const res = await request.post("/api/webhook").send({ name: "gas", callbackUrl: "http://localhost:3100/api/data" });
    expect(res.status).toBe(200);
    expect(res.body.providers[0].name).toBe("gas");
    expect(res.body.providers[0].data[0].data[0].amount).toBe(22.27);
  });

  it("Should give status 200 with the data containing all providers", async () => {
    mock.onGet("http://127.0.0.1:3000/providers/gas").reply(200, gas);
    mock.onGet("http://127.0.0.1:3000/providers/internal").reply(200, internal);
    mock.onPost("http://localhost:3100/api/data").reply(200);
    const res = await request
      .post("/api/webhook")
      .send({ name: ["gas", "internal"], callbackUrl: "http://localhost:3100/api/data" });

    expect(res.status).toBe(200);
    expect(res.body.providers[0].name).toBe("gas");
    expect(res.body.providers[1].name).toEqual("internal");
    expect(res.body.providers[0].data[0].data[0].amount).toEqual(22.27);
    expect(res.body.providers[1].data[0].data[0].amount).toEqual(15.12);
  });
});
