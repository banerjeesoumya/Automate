import { Context } from "hono";
import { getDB } from "../db/client";
import { loginSchema, registerSchema } from "../types/types";
import { userRoles, users } from "../db/schema";
import * as schema from "../db/schema";
import { sign } from "hono/jwt";
import { DrizzleD1Database } from "drizzle-orm/d1";

type DB = DrizzleD1Database<typeof schema>;

export const registerUser = async (c: Context) => {
    const db = c.get('db') as DB;
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
        c.status(400);
        return c.json({
            message: "Invalid request",
            errors: parsed.error.errors.map(e => e.message)
        });
    }
    try {
        const userExists = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, parsed.data.email)
        })
        if (userExists) {
            c.status(400);
            return c.json({ message: "User already exists" });
        } else {
            const newUser = await db.insert(users).values({
                email: parsed.data.email,
                hashedPassword: parsed.data.password,
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName
            }).returning({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
            });
            const role = await db.insert(userRoles).values({
                userId: newUser[0].id,
                roleId: parsed.data.roleId
            });
            c.status(201);
            return c.json({
                message: "User registered successfully",
                user: newUser[0]
            });
        }

    } catch (error) {
        c.status(500);
        return c.json({
            message: "Internal server error",
            error: (error as Error).message
        });
    }
}

export const loginUser = async (c: Context) => {
    const db = c.get('db') as ReturnType<typeof getDB>;
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
        c.status(400);
        return c.json({
            message: "Invalid request",
            errors: parsed.error.errors.map(e => e.message)
        });
    }
    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, parsed.data.email)
        });
        if (!user) {
            c.status(401);
            return c.json({ message: "Invalid email or password" });
        }
        // Here you would normally compare the hashed password
        const roleRecord = await db.query.userRoles.findFirst({
            where: (userRoles, { eq }) => eq(userRoles.userId, user.id)
        });
        const token = await sign({
            id: user.id,
            role: roleRecord?.roleId
        }, c.env.JWT_SECRET);

        c.status(200);
        return c.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roleId: roleRecord?.roleId
            }
        });
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
}