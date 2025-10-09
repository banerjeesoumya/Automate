import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const authMiddleware = (roles: string[] = []) => {
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

            if (roles.length > 0 && !roles.includes(user.role as string)) {
                c.status(403);
                return c.json({ message: "Forbidden" });
            }
            c.set('user', user);
            c.set('userId', String(user.id));
            c.set('userRole', String(user.role));
            await next();
        } catch (error) {
            c.status(401);
            return c.json({ message: "Unauthorized"});
        }
    }
}