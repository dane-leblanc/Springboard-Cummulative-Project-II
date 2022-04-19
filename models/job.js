"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job from POST data, update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
                (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];
    return job;
  }

  /** Update a job with 'data'.
   *
   * This is a partial update (not all data is required).
   *
   * Data can include: { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                        SET ${setCols}
                        WHERE id = ${idVarIdx}
                        RETURNING id,
                            title,
                            salary,
                            equity,
                            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle }]
   */

  static async findAll() {
    let query = `SELECT title, salary, equity, 
                    company_handle AS "companyHandle"
                    FROM jobs`;

    let result = await db.query(query);
    return result.rows;
  }

  /** Get job info by id.
   *
   *
   * Returns {id, title, salary, equity, companyHandle, company }]
   *  where company is { handle, name, description, numEmployees, logoUrl}
   * Throws "not found" if no id match.
   */

  static async get(id) {
    const jobResponse = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
            FROM jobs
            WHERE id=$1`,
      [id]
    );

    const job = jobResponse.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
            FROM companies
            WHERE handle=$1`,
      [job.companyHandle]
    );
    delete job.companyHandle;
    job.company = companiesRes.rows[0];

    return job;
  }

  /** remove job by id
   *    Throws "not found" if no id match. 
   */

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs
            WHERE id=$1
            RETURNING id`,
      [id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}
module.exports = Job;
