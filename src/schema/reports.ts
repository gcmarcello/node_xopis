import z from "zod";

export const salesReportSchema = z.object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    product_id: z.number().optional(),
})

export type SalesReportSchema = z.infer<typeof salesReportSchema>
