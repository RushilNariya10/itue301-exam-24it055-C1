/**
 * Task 3 – requestLogger middleware
 *
 * Logs [METHOD] [PATH] [TIMESTAMP] for every incoming request.
 * Applied globally in server.js before any route handlers.
 */
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] ${req.path} ${timestamp}`);
  next();
}

module.exports = requestLogger;
