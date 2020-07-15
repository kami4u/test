const app = require("./index");
const supertest = require("supertest");
const request = supertest(app);

describe("Provider", () => {
  it("Should give status 404 and error without body params", async () => {
    const res = await request.post("/api/webhook");
    expect(res.status).toBe(404);
    expect(res.text).toBe("Payload is not right need to have name and callbackUrl");
  });

  it("Should give status 500 or 404 and error with wrong name", async () => {
    const res = await request.post("/api/webhook").send({ name: "asd", callbackUrl: "http://localhost:3100/api/data" });
    if (res.status === 500) {
      expect(res.text).toBe("Provider Api is Failing with message #fail");
    } else {
      expect(res.status).toBe(404);
      expect(res.text).toBe("Provider asd Does not exist");
    }
  });

  it("Should give status 200 or 500 with the data", async () => {
    const response = [
      {
        name: "gas",
        data: [
          {
            billedOn: "2020-04-07T15:03:14.257Z",
            amount: 22.27,
          },
          {
            billedOn: "2020-05-07T15:03:14.257Z",
            amount: 30,
          },
        ],
      },
    ];
    const res = await request.post("/api/webhook").send({ name: "gas", callbackUrl: "http://localhost:3100/api/data" });
    if (res.status === 500) {
      expect(res.text).toBe("Provider Api is Failing with message #fail");
    } else {
      expect(res.status).toBe(200);
      expect(res.body).toEqual(response);
    }
  });

  it("Should give status 200 or 500 with the data", async () => {
    const response = [
      {
        name: "gas",
        data: [
          {
            billedOn: "2020-04-07T15:03:14.257Z",
            amount: 22.27,
          },
          {
            billedOn: "2020-05-07T15:03:14.257Z",
            amount: 30,
          },
        ],
      },
      {
        name: "internet",
        data: [
          {
            billedOn: "2020-02-07T15:03:14.257Z",
            amount: 15.12,
          },
          {
            billedOn: "2020-03-07T15:03:14.257Z",
            amount: 15.12,
          },
        ],
      },
    ];
    const res = await request
      .post("/api/webhook")
      .send({ name: ["gas", "internal"], callbackUrl: "http://localhost:3100/api/data" });
    if (res.status === 500) {
      expect(res.text).toBe("Provider Api is Failing with message #fail");
    } else {
      expect(res.status).toBe(200);
      expect(res.body).toEqual(response);
    }
  });
});
