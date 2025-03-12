import type { FastifyReply, FastifyRequest } from "fastify";
import { OrderStatus } from "../../models/Order";
import { InvalidAmountError } from "../../errors/invalidAmount";
import { NotFoundError } from "objection";
import { findProductsFromOrderItems } from "../../services/products.service";
import { calculateOrderTotals, createOrder } from "../../services/orders.service";
import { type OrderItemAttributes } from "../../models/OrderItem";

type Request = FastifyRequest<{
    Body: {
        customer_id: number;
        items: OrderItemAttributes[];
    }
}>;

export default async (
    { body: { customer_id, items } }: Request,
    reply: FastifyReply
) => {
    try {
        const orderItems = items ?? []
        const products = await findProductsFromOrderItems(orderItems)
        const productPriceMap = new Map(products.map(product => [product.id, product.price]));
        const { total_paid, total_discount, total_shipping, total_tax } = calculateOrderTotals(orderItems, productPriceMap);

        const order = await createOrder({
            customer_id,
            total_discount,
            total_paid,
            total_shipping,
            total_tax,
            status: OrderStatus.PaymentPending
        }, orderItems, productPriceMap);

        return reply.code(201).send(order);
    } catch (error) {
        if (error instanceof InvalidAmountError) {
            return reply.code(400).send(error);
        }
        if (error instanceof NotFoundError) {
            return reply.code(400).send({ message: error.message });
        }
        return reply.send(error);
    };
}




