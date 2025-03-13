import z from "zod";

export const salesReportSchema = z.object({
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    product_id: z.coerce.number().optional(),
})

export type SalesReportSchema = z.infer<typeof salesReportSchema>
