class Response {
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message, error = null, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}

module.exports = { Response };
