function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: 'Oops! Something went wrong!' });
}

export default errorHandler;
