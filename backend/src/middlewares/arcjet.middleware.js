import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1,
        });

        if (decision.isDenied) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({
                    message: "Rate limit exceeded. Please try again later.",
                    error: "Too many requests",
                });
            } else if (decision.reason.isBot()) {
                res.status(403).json({ message: "Access denied for bots", error: "Bot detected" });
            } else {
                res.status(403).json({ message: "Access denied by security", error: "Forbidden" });
            }
        }

        // check for spoofing
        if (decision.results.some((result) => result.reason.isSpoofed() && result.reason.isBot())) {
            res.status(403).json({ message: "Access denied for spoofed requests", error: "Spoofed request" });
            return;
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: "Unexpected error" });
        console.error("Arcjet Middleware Error:", error);
        next();
    }
};