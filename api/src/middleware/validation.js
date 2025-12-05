// api/src/middleware/validation.js

// Simple stub validator for now.
// It just calls next() and doesn't block anything.
const validate = (_schemaName) => {
  return (req, _res, next) => {
    // Later you can add real validation based on schemaName
    next();
  };
};

module.exports = { validate };
