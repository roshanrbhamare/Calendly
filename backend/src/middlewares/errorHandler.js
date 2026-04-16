const errorHandler = (err, req, res, next) => {
    console.error('Error Details:', err);

    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.errors
        });
    }

    // Handle MySQL Duplicate Entry Error
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'Conflict Error',
            message: 'Resource already exists or double booking detected.'
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong on the server'
    });
};

module.exports = errorHandler;
