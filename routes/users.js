"use strict";

/** Routes for users. */

const express = require("express");
const { ensureAdmin, ensureAdminOrThisUser } = require("../middleware/auth");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { validationHelper } = require("../helpers/validate");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    validationHelper(req.body, userNewSchema);

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: admin or user getting their own information
 **/

router.get(
  "/:username",
  ensureAdminOrThisUser,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or user updating their own information
 **/

router.patch(
  "/:username",
  ensureAdminOrThisUser,
  async function (req, res, next) {
    try {
      validationHelper(req.body, userUpdateSchema);

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** Apply /user/[username]/jobs/[jobId]
 *
 **/

router.post(
  "/:username/jobs/:id",
  ensureAdminOrThisUser,
  async function (req, res, next) {
    try {
      const jobId = +req.params.id;
      await User.apply(req.params.username, jobId);
      return res.json({ applied: jobId });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or user deleting their own account
 **/

router.delete(
  "/:username",
  ensureAdminOrThisUser,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
