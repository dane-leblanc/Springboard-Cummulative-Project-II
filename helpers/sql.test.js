const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("Update two items", function () {
    const result = sqlForPartialUpdate(
      {
        firstField: "first value",
        secondField: "second value",
      },
      {
        firstField: "firstField",
        secondField: "secondField",
      }
    );
    expect(result).toEqual({
      setCols: '"firstField"=$1, "secondField"=$2',
      values: ["first value", "second value"],
    });
  });
});
