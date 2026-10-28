// Keep only allowed keys from a request body (ignores anything else sent by the client)
module.exports = (body = {}, fields = []) =>
  fields.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
    return acc;
  }, {});
