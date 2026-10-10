function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected server error occurred.';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(' ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid value supplied.';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists.';
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  } else if (statusCode >= 500) {
    message = 'An unexpected server error occurred.';
    console.error('Unhandled request error:', err.name || 'Error');
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
