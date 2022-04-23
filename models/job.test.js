"use strict";

const db = require("../db.js");
const { NotFoundError, BadRequestError } = require("../expressError.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 100000,
    equity: "0",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
                FROM jobs
                WHERE title='New Job'`
    );
    expect(result.rows).toEqual([
      {
        title: "New Job",
        salary: 100000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });
});

/************************ update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 1000000,
    equity: "0.6",
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      title: "New",
      salary: 1000000,
      equity: "0.6",
      companyHandle: "c1",
    });
  });

  test("not found if no match for id", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************ Find all */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "title1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
      {
        title: "title2",
        salary: 200000,
        equity: "1",
        companyHandle: "c2",
      },
      {
        title: "title3",
        salary: 300000,
        equity: "0.8",
        companyHandle: "c3",
      },
    ]);
  });
});

describe("findAll filters", function () {
  test("title filter works", async function () {
    let jobs = await Job.findAll({
      title: "title1",
    });
    expect(jobs).toEqual([
      {
        title: "title1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    ]);
  });

  test("Min Salary filter works", async function () {
    let jobs = await Job.findAll({
      minSalary: 150000,
    });
    expect(jobs).toEqual([
      {
        title: "title2",
        salary: 200000,
        equity: "1",
        companyHandle: "c2",
      },
      {
        title: "title3",
        salary: 300000,
        equity: "0.8",
        companyHandle: "c3",
      },
    ]);
  });

  test("Equity filter works", async function () {
    let jobs = await Job.findAll({
      hasEquity: true,
    });
    expect(jobs).toEqual([
      {
        title: "title1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
      {
        title: "title2",
        salary: 200000,
        equity: "1",
        companyHandle: "c2",
      },
      {
        title: "title3",
        salary: 300000,
        equity: "0.8",
        companyHandle: "c3",
      },
    ]);
  });
});

/*********************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      id: jobIds[0],
      title: "title1",
      salary: 100000,
      equity: "0.5",
      company: {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      },
    });
  });

  test("not found if no id match", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "title2",
        salary: 200000,
        equity: "1",
        companyHandle: "c2",
      },
      {
        title: "title3",
        salary: 300000,
        equity: "0.8",
        companyHandle: "c3",
      },
    ]);
  });

  test("not found if no id match", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
