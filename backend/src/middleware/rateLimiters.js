import rateLimit from 'express-rate-limit';

// Auth rate limiter: 5 requests per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Upload rate limiter: 10 uploads per hour
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per windowMs
    message: {
        success: false,
        message: 'Upload limit exceeded. You can upload 10 videos per hour. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests. Please slow down and try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health';
    }
});
