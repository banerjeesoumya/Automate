import z from 'zod';
import { PAGINATION } from '../../utils/constants';

export const getOneWorkflowSchema = z.object({
    id: z.string()
})

export const getAllWorkflowsSchema = z.object({
    page: z
        .string()
        .default(String(PAGINATION.DEFAULT_PAGE))
        .transform((val) => Number(val)),
    pageSize: z
        .string()
        .default(String(PAGINATION.DEFAULT_PAGE_SIZE))
        .transform((val) => Number(val))
        .refine((val) => val >= PAGINATION.MIN_PAGE_SIZE && val <= PAGINATION.MAX_PAGE_SIZE, {
            message: `pageSize must be between ${PAGINATION.MIN_PAGE_SIZE} and ${PAGINATION.MAX_PAGE_SIZE}`,
        }),
    search: z.string().optional().default(""),
});

export const deleteWorkflowSchema = z.object({
    id: z.string()
});

export const updateWorkflowSchema = z.object({
    nodes: z.array(
        z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({
                x: z.number(),
                y: z.number()
            }),
            data: z.record(z.string(), z.any()).optional()
        })
    ),
    edges: z.array(
        z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
        })
    )
})
