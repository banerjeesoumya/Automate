import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const authMiddleware = () => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            c.status(401);
            return c.json({ message: "Unauthorized" });
        }

        const [schema, token] = authHeader.split(' ');
        if (schema !== 'Bearer' || !token) {
            c.status(401);
            return c.json({ message: "Unauthorized" });
        }

        try {
            const user = await verify(token, c.env.JWT_SECRET);
            if (!user) {
                c.status(401);
                return c.json({ message: "Unauthorized" });
            }
            c.set('userId', String(user.id));
            await next();
        } catch (error) {
            c.status(401);
            return c.json({ message: "Unauthorized"});
        }
    }
}