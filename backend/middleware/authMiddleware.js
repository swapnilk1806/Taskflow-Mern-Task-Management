const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization');
  const [scheme, token, ...extraParts] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token || extraParts.length > 0) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide a valid Bearer token.'
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'The account for this token no longer exists.'
    });
  }

  req.user = user;
  next();
});

module.exports = authenticate;
