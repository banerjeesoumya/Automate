import { Hono } from "hono";
import { Env } from "../types/env";
import { authMiddleware } from "../utils/authMiddleware";
import { getDB } from "../db/client";
import { createEmployeeSchema, updateEmployeeSchema } from "../types/types";
import { eq } from "drizzle-orm";
import { employees, users } from "../db/schema";
import { v4 as uuid } from "uuid";


interface UserPayload {
    id: string;
    role: string;
}

export const employeeRouter = new Hono<{
    Bindings: Env;
    Variables: {
        user: UserPayload;
    }
}>()

employeeRouter.post('/', authMiddleware(['admin', 'hr']), async (c) => {
    const db = getDB(c.env);
    const body = await c.req.json();
    const user = c.get('user');
    console.log(user);
    const role = user?.role;
    console.log(role);
    if (role !== 'admin' && role !== 'hr') {
        return c.json({ message: "Forbidden" }, 403);
    }
    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) {
        const errorMessages = parsed.error.errors.map(e => e.message);
        return c.json({ message: "Invalid request", errors: errorMessages }, 400);
    }
    try {
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, parsed.data.user_id)
        })
        if (!userExists) {
            return c.json({ message: "User does not exist" }, 400);
        }
        const existingEmployee = await db.query.employees.findFirst({
            where: eq(employees.user_id, parsed.data.user_id)
        });

        if (existingEmployee) {
            c.status(400);
            return c.json({ message: 'Employee already exists for this user' });
        }
        const id = uuid();
        const employee = await db.insert(employees).values({
            id: id,
            user_id: parsed.data.user_id,
            department: parsed.data.department,
            designation: parsed.data.designation,
            manager_id: parsed.data.manager_id,
            role: parsed.data.role
        });
        c.status(201);
        return c.json({
            message: "Employee created successfully",
            employee: {
                id: employee.id,
                user_id: employee.user_id,
                department: employee.department,
                designation: employee.designation,
                manager_id: employee.manager_id,
                role: employee.role
            }
        });
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
});

employeeRouter.get('/', authMiddleware(['admin', 'hr']), async (c) => {
    const role = c.get('user').role;
    if (role !== 'admin' && role !== 'hr') {
        return c.json({ message: "Forbidden" }, 403);
    }
    const db = getDB(c.env);
    try {
        const allEmployees = await db
            .select({
            id: employees.id,
            user_id: employees.user_id,
            department: employees.department,
            designation: employees.designation,
            manager_id: employees.manager_id,
            role: employees.role,
            name: users.name,
            email: users.email,
            })
            .from(employees)
            .innerJoin(users, eq(employees.user_id, users.id));
        if (allEmployees.length === 0) {
            return c.json({ message: "No employees found" }, 404);
        }
        return c.json({
            message: "Employees fetched successfully",
            employees: allEmployees
        });
    } catch (error) {
        return c.json({ message: "Internal server error" }, 500);
    }
})

employeeRouter.get('/:id', authMiddleware(['admin', 'hr']), async (c) => {
    const role = c.get('user').role;
    if (role !== 'admin' && role !== 'hr') {
        return c.json({ message: "Forbidden" }, 403);
    }
    const db = getDB(c.env);
    const { id } = c.req.param();
    try {
        const employee = await db
            .select({
                id: employees.id,
                user_id: employees.user_id,
                department: employees.department,
                designation: employees.designation,
                manager_id: employees.manager_id,
                role: employees.role,
                name: users.name,
                email: users.email,
            })
            .from(employees)
            .where(eq(employees.id, id))
            .innerJoin(users, eq(employees.user_id, users.id));
        if (!employee || employee.length === 0) {
            return c.json({ message: "Employee not found" }, 404);
        }
        return c.json({
            message: "Employee fetched successfully",
            employee: employee[0]
        });
    } catch (error) {
        return c.json({ message: "Internal server error" }, 500);
    }
});

employeeRouter.patch('/:id', authMiddleware(['admin', 'hr']), async (c) => {
    const role = c.get('user').role;
    if (role !== 'admin' && role !== 'hr') {
        return c.json({ message: "Forbidden" }, 403);
    }
    const db = getDB(c.env);
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = updateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
        const errorMessages = parsed.error.errors.map(e => e.message);
        return c.json({ message: "Invalid request", errors: errorMessages }, 400);
    }
    try {
        const employee = await db.query.employees.findFirst({
            where: eq(employees.id, id)
        })
        if (!employee) {
            return c.json({ message: "Employee not found" }, 404);
        }
        await db.update(employees).set({
            department: parsed.data.department,
            designation: parsed.data.designation,
            manager_id: parsed.data.manager_id
        }).where(eq(employees.id, employee.id));
        return c.json({ message: "Employee updated successfully" });
    }
    catch (error) {
        return c.json({ message: "Internal server error" }, 500);
    }
});

employeeRouter.delete('/:id', authMiddleware(['admin', 'hr']), async (c) => {
    const role = c.get('user').role;
    if (role !== 'admin' && role !== 'hr') {
        return c.json({ message: "Forbidden" }, 403);
    }
    const db = getDB(c.env);
    const { id } = c.req.param();
    try {
        const employee = await db.query.employees.findFirst({
            where: eq(employees.id, id)
        });
        if (!employee) {
            return c.json({ message: "Employee not found" }, 404);
        }
        await db.delete(employees).where(eq(employees.id, id));
        return c.json({ message: "Employee deleted successfully" });
    } catch (error) {
        return c.json({ message: "Internal server error" }, 500);
    }
})