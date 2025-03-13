import z from "zod";
import { upsertOrderItemSchema } from "./orderItems";
import { OrderStatus } from "src/models";

export const upsertOrderSchema = z.object({
    id: z.number().optional(),
    customer_id: z.number(),
    status: z.nativeEnum(OrderStatus).optional(),
    items: z.array(upsertOrderItemSchema).optional(),
})

export type UpsertOrderSchema = z.infer<typeof upsertOrderSchema>
