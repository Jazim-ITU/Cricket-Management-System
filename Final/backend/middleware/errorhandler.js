
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);
  if (err.stack) console.error(err.stack);

 
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry. Resource already exists.' });
  }

  
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Referenced resource does not exist.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ success: false, message });
};


const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };