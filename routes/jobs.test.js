"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************* POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "TestJob",
    salary: 1,
    equity: "0",
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "TestJob",
        salary: 1,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 2,
        companyHandle: "c2",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "TestJob2",
        salary: "Lots of Money",
        companyHandle: "c2",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized if anonymous", async function () {
    const resp = await request(app).post("/jobs").send(newJob);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized if not admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************ GET /jobs with filters */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 1,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          title: "j2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c1",
        },
        {
          title: "j3",
          salary: 3,
          equity: "0.3",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("ok to filter by title", async function () {
    const resp = await request(app).get("/jobs?title=j2");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("ok to filter by min salary", async function () {
    const resp = await request(app).get("/jobs?minSalary=2");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j2",
          salary: 2,
          equity: "0.2",
          companyHandle: "c1",
        },
        {
          title: "j3",
          salary: 3,
          equity: "0.3",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("bad request if min salary is NaN", async function () {
    const resp = await request(app).get("/jobs?minSalary=money");
    expect(resp.statusCode).toEqual(400);
  });

  test("ok to filter by 'has equity'", async function () {
    const resp = await request(app).get("/jobs?hasEquity=false");
    expect(resp.body).toEqual({
      jobs: [],
    });
  });

  test("bad request if hasEquity is not true/false", async function () {
    const resp = await request(app).get("/jobs?hasEquity=nahbro");
    expect(resp.statusCode).toEqual(400);
  });
});

/***************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "j1",
        salary: 1,
        equity: "0.1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("response for no job found", async function () {
    const resp = await request(app).get("/jobs/0");
    expect(resp.statusCode).toEqual(404);
  });
});

/*************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "j1-new",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("response for no job found", async function () {
    const resp = await request(app)
      .patch("/jobs/0")
      .send({ title: "j1-new" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({ salary: "one million dollars" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized for user", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({ salary: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for not logged in", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({ salary: 2 });
    expect(resp.statusCode).toEqual(401);
  });
});

/***************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: jobIds[0] });
  });

  test("404 for id not found", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauth for non admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for not signed in", async function () {
    const resp = await request(app).delete(`/jobs/${jobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });
});
