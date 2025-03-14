import z from "zod";

export const upsertOrderItemSchema = z.object({
    product_id: z.number(),
    quantity: z.number(),
    discount: z.number().optional(),
    tax: z.number().optional(),
    shipping: z.number().optional(),
})

export type UpsertOrderItemSchema = z.infer<typeof upsertOrderItemSchema>
