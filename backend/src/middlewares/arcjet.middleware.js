import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1,
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({
                    message: "Rate limit exceeded. Please try again later.",
                    error: "Too many requests",
                });
            } else if (decision.reason.isBot()) {
                if (decision.reason.isSpoofed()) {
                    return res.status(403).json({
                        message: "Access denied for spoofed bots",
                        error: "Spoofed bot detected",
                    });
                }
                return res.status(403).json({ message: "Access denied for bots", error: "Bot detected" });
            } else {
                return res.status(403).json({ message: "Access denied by security", error: "Forbidden" });
            }
        }

        next();
    } catch (error) {
        console.error("Arcjet Middleware Error:", error);
        next();
    }
};