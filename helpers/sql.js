const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Helper for making update queries and handling PATCH requests.
 *
 * @param dataToUpdate {Object} {field1: newValue, field2: newValue, ...}
 * @param jsToSql {Object} maps values from js object to db column names. ex: { firstName: "first_name", lastName: "last_name"}
 *
 * @example {firstName: "Dane", lastName: "LeBlanc" } =>
 * { setCols: "first_name"=$1, "last_name"=$2,
 *    values: ['Dane', 'LeBlanc'] }
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
