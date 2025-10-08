import { drizzle } from "drizzle-orm/d1";
import { Env } from "../types/env";
import * as schema from "./schema"

export function getDB(env: Env) {
    return drizzle(env.hr_d1, { schema });
}