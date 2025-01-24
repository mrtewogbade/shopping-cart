import rateLimit from "express-rate-limit";

const Limiter = rateLimit({
    windowMs: 20 * 1000,
    limit: 4,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        console.log(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    },
});

export default Limiter;

