"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const Job = require("../models/company");
const { ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const jobNewSchema = require("../schemas/jobNew.json");

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
    console.log(err);
    return next(err);
  }
});

module.exports = router;
