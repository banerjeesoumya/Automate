import z from "zod";
import { PAGINATION } from "../../utils/constants";

export const getAllExecutionsSchema = z.object({
    page: z
        .string()
        .default(String(PAGINATION.DEFAULT_PAGE))
        .transform((val) => Number(val)),
    pageSize: z.
        string()
        .default(String(PAGINATION.DEFAULT_PAGE_SIZE))
        .transform((val) => Number(val))
        .refine((val) => val >= PAGINATION.MIN_PAGE_SIZE && val <= PAGINATION.MAX_PAGE_SIZE, {
                message: `pageSize must be between ${PAGINATION.MIN_PAGE_SIZE} and ${PAGINATION.MAX_PAGE_SIZE}`,
            }),
    search: z.string().optional().default(""),
})