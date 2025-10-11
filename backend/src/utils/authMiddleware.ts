import { Context, Next } from "hono";
import { createAuth } from "./auth";

export const authMiddleware = () => {
    return async (c: Context, next: Next) => {
        const auth = createAuth(c.env);
        
        const session = await auth.api.getSession(c.req.raw);
        if (!session || !session.user) {
            c.status(401);
            return c.json({ message: "Unauthorized" });
        }
        c.set('userId', String(session.user.id));
        await next();
    }
}

