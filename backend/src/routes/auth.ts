import { Hono } from "hono";
import { Env } from "../types/env";
import { getDB } from "../db/client";
import { signInSchema, signUpSchema } from "../types/types";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { sign } from "hono/jwt";


export const authRouter = new Hono<{
  Bindings: Env
}>();

authRouter.post('/signup', async (c) => {
    const db = getDB(c.env);
    const body = await c.req.json();

    const correctSignUpBody = signUpSchema.safeParse(body);
    if (!correctSignUpBody.success) {
        c.status(400);
        return c.json({
            message: "Invalid request",
            errors: correctSignUpBody.error.errors.map(e => e.message)
        });
    }

    try {
        const userExists = await db.select().from(users).where(
            eq(users.email, correctSignUpBody.data.email)
        ); 
        if (userExists && userExists.length > 0) {
            c.status(409);
            return c.json({
                message: "User already exists"
            });
        } else {
            const id = uuid();
            await db.insert(users).values({
                id: id,
                name: correctSignUpBody.data.name,
                email: correctSignUpBody.data.email,
                password_hash: correctSignUpBody.data.password, 
                role: correctSignUpBody.data.role
            });
            c.status(201);
            return c.json({
                message: "User created successfully",
                user: {
                    id: id,
                    name: correctSignUpBody.data.name,
                    email: correctSignUpBody.data.email,
                    role: correctSignUpBody.data.role
                }
            });
        }

    } catch (error) {
        c.status(500);
        return c.json({
            message: "Internal server error"
        });
    }
})

authRouter.post('/signin', async (c) => {
    const db = getDB(c.env);
    const body = await c.req.json();

    const correctSignInBody = signInSchema.safeParse(body);
    if (!correctSignInBody.success) {
        const errorMessage = correctSignInBody.error.errors.map(e => e.message).join(", ");
        c.status(400);
        return c.json({
            message: errorMessage
        })
    }
    try {
        const user = await db.select().from(users).where(
            eq(users.email, correctSignInBody.data.email)
        ).limit(1);
        if (user.length === 0) {
            c.status(404);
            return c.json({
                message: "User not found"
            });
        }
        const token = await sign({
            id: user[0].id,
            role: user[0].role
        }, c.env.JWT_SECRET);
        return c.json({
            message: "User signed in successfully",
            token: token,
            user: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role
            }
        });
    } catch (error : any) {
        c.status(500);
        return c.json({
            message: "Internal server error",
            error: error.message
        })
    }
});