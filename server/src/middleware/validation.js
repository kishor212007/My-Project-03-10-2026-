function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({ error: 'Validation failed', details });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({ error: 'Validation failed', details });
      }
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  };
}

module.exports = {
  validateBody,
  validateQuery
};
