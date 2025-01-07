import ResponseError from "../errors/ResponseError.js";

function validate(schema, value) {
  const result = schema.validate(value);

  if (result.error) {
    throw new ResponseError(400, result.error.message);
  }

  return result.value;
}

export default validate;
