import { Hono } from "hono";
import { Env } from "../types/env";
import { loginUser, registerUser } from "../controllers/authController";


export const authRouter = new Hono<{ Bindings: Env }>();

authRouter.post('/signup', registerUser)

authRouter.post('/signin', loginUser);