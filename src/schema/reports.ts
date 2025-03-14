import z from "zod";

export const datesSchema = z.object({
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
})

export type DatesSchema = z.infer<typeof datesSchema>

export const salesReportSchema = z.object({
    product_id: z.coerce.number().optional(),
}).merge(datesSchema)

export type SalesReportSchema = z.infer<typeof salesReportSchema>

export const topProductsSchema = z.object({
    breakdown: z.coerce
        .string()
        .transform(value => value.toLowerCase() === "true")
        .pipe(z.boolean())
}).merge(datesSchema)

export type TopProductsSchema = z.infer<typeof topProductsSchema>
