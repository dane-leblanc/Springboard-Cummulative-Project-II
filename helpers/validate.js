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

function validateCompanyFilter(filters = {}) {
  const { minEmployees, maxEmployees } = filters;
  if (minEmployees !== undefined && isNaN(+minEmployees)) {
    throw new BadRequestError("Min Employees must be a number");
  }
  if (maxEmployees !== undefined && isNaN(+maxEmployees)) {
    throw new BadRequestError("Max Employees must be a number");
  }
  if (+minEmployees > +maxEmployees) {
    throw new BadRequestError("Min cannot be greater than Max");
  }
  return true;
}

function validateJobFilter(filters = {}) {
  const { minSalary, hasEquity } = filters;
  if (minSalary !== undefined && isNaN(+minSalary)) {
    throw new BadRequestError("Min Salary must be a number");
  }

  if (
    hasEquity !== undefined &&
    hasEquity !== "true" &&
    hasEquity !== "false"
  ) {
    throw new BadRequestError("hasEquity must be either 'true' of 'false'");
  }
  return true;
}

module.exports = { validationHelper, validateCompanyFilter, validateJobFilter };
