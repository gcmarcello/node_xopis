import type { FastifyReply, FastifyRequest } from "fastify";
import { Order, OrderStatus } from "../../models/Order";
import { Product } from "../../models/Product";

type Request = FastifyRequest<{
    Body: {
        customer_id: number;
        items: {
            product_id: number;
            quantity: number;
            discount?: number;
        }[];
    }
}>;

export default async (
    { body: { customer_id, items } }: Request,
    reply: FastifyReply
) => {
    const products = await Product.query().findByIds(items.map((item) => item.product_id));

    const total_paid = items.reduce((acc, item) => {
        const product = products.find((product) => product.id === item.product_id);
        return acc + (product?.price || 0) * item.quantity;
    }, 0);

    const total_discount = items.reduce((acc, item) => {
        return acc + (item.discount || 0);
    }, 0);

    // in this example, we are not calculating shipping and tax
    const total_shipping = 0;
    const total_tax = 0;

    return Order.query().insertGraph({
        customer_id,
        items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            discount: item.discount || 0,
            paid: 0,
            tax: 0,
            shipping: 0,
        })),
        total_discount,
        total_paid,
        total_shipping,
        total_tax,
        status: OrderStatus.PaymentPending
    })
        .then((order) => reply.code(201).send(order))
        .catch((error) => {
            return reply.send(error);
        });
}

