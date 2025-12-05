const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(new UnauthorizedError('Invalid or expired token'));
      }

      req.user = user;
      next();
    });
  } else {
    next(new UnauthorizedError('Authorization header missing'));
  }
};

module.exports = {
  authenticateJWT,
};