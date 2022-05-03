const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");

function validationHelper(content, schema) {
  const validator = jsonschema.validate(content, schema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }
  return true;
}

module.exports = { validationHelper };
