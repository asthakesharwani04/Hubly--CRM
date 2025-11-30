const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    // Log error for dev
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
  
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      error = { message, statusCode: 400 };
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      error = { message, statusCode: 400 };
    }
  
    // Mongoose cast error
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  export default errorHandler;