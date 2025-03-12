import type { FastifyReply, FastifyRequest } from "fastify";
import { Order, OrderStatus } from "../../models/Order";
import { Product } from "../../models/Product";
import { InvalidAmountError } from "../../errors/invalidAmount";
import { NotFoundError } from "objection";
import { OrderItem } from "../../models";

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
    try {
        const orderItems = items ?? []
        const products = await Product.query().findByIds(orderItems.map(item => item.product_id));
        const missingProduct = orderItems.filter(item => !products.find(product => product.id === item.product_id));

        if (missingProduct.length) {
            throw new NotFoundError({ message: 'Product not found' + missingProduct.map(item => item.product_id).join(', ') });
        }

        const productPriceMap = new Map(products.map(product => [product.id, product.price]));

        let total_paid = 0;
        let total_discount = 0;
        let total_shipping = 0;
        let total_tax = 0;

        for (const item of orderItems) {
            const price = productPriceMap.get(item.product_id) || 0;
            const itemDiscount = item.discount || 0;
            const itemTax = 0;
            const itemShipping = 0;
            const itemTotal = (price * item.quantity)

            if (item.discount && item.discount < 0) throw new InvalidAmountError(`Invalid amount for discount on product ${item.product_id}`)
            if (item.quantity < 0) throw new InvalidAmountError(`Invalid amount for quantity on product ${item.product_id}`)

            total_paid += Math.max((itemTotal + itemTax + itemShipping) - itemDiscount, 0);
            total_discount += itemDiscount;
            total_shipping += itemShipping;
            total_tax += itemTax;
        }

        const order = await Order.transaction(async (trx) => {
            const order = await Order.query(trx).insertGraph({
                customer_id,
                total_paid,
                total_discount,
                total_shipping,
                total_tax,
                status: OrderStatus.PaymentPending
            });

            const orderItemsData = orderItems.map(item => {
                const price = productPriceMap.get(item.product_id) || 0;
                const itemDiscount = item.discount || 0;
                const itemTax = 0;
                const itemShipping = 0;
                const itemTotal = (price * item.quantity)
                const itemPaid = Math.max(itemTotal - itemDiscount, 0)

                return {
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    discount: itemDiscount,
                    paid: itemPaid,
                    tax: itemTax,
                    shipping: itemShipping,
                };
            });

            const items = orderItemsData.length ? await OrderItem.knex()
                .batchInsert("orders_items", orderItemsData, 100)
                .transacting(trx)
                // as any needed due to a bug in objection types
                .returning(['discount', 'id', 'order_id', 'paid', 'product_id', 'quantity', 'shipping', 'tax'] as any[]) : [];

            return { ...order, items }
        })

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




