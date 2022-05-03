"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const Job = require("../models/job");
const { ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST {job} => {job}
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *  { jobs: [ title, salary, equity, company ]}
 *      where company => { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const query = req.query;
    const jobs = await Job.findAll(query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /jobs/:id =>
 *  { job: { id, title, salary, equity, company} }
 *    where company => { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required, none
 * */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

/** PATCH /:id  { fld1, fld2, ... } => { job }
 *
 * Patches Job Data
 *
 * Fields can be: { title, salary, equity, companyHandle }
 *
 * Returns: { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /jobs/:id {deleted: title}
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});
