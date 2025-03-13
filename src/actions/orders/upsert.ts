import type { FastifyReply, FastifyRequest } from "fastify";
import { OrderStatus } from "../../models/Order";
import { InvalidAmountError } from "../../errors/invalidAmount";
import { NotFoundError } from "objection";
import { findProductsFromOrderItems } from "../../services/products.service";
import { calculateOrderTotals, upsertOrder } from "../../services/orders.service";
import { type OrderItemAttributes } from "../../models/OrderItem";
import { NonPendingOrderItemUpdateError } from "../../errors/nonPendingOrderItemUpdateError.ts";

type Request = FastifyRequest<{
    Body: {
        id?: number;
        customer_id: number;
        items: OrderItemAttributes[];
        status: OrderStatus;
    }
}>;

export default async (
    { body: { customer_id, items, id, status } }: Request,
    reply: FastifyReply
) => {
    const orderItems = items ?? []
    const products = await findProductsFromOrderItems(orderItems)
    const productPriceMap = new Map(products.map(product => [product.id, product.price]));
    const { total_paid, total_discount, total_shipping, total_tax } = calculateOrderTotals(orderItems, productPriceMap);

    const order = await upsertOrder({
        id,
        customer_id,
        total_discount,
        total_paid,
        total_shipping,
        total_tax,
        status
    }, productPriceMap, orderItems);

    return reply.code(201).send(order);
}




