import type { FastifyReply, FastifyRequest } from "fastify";
import { Order, OrderStatus } from "../../models/Order";
import { Product } from "../../models/Product";
import { InvalidAmountError } from "src/errors/invalidAmount";
import { NotFoundError } from "objection";

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
        const products = orderItems ? await Product.query().findByIds(orderItems.map(item => item.product_id)) : [];

        if (products.length !== orderItems.length) {
            throw new NotFoundError({message: 'Product not found'});
        }

        const productPriceMap = new Map(products.map(product => [product.id, product.price]));

        let total_price = 0;
        let total_discount = 0;
        let total_shipping = 0;
        let total_tax = 0;


        const orderItemsData = orderItems.map(item => {
            if (item.discount && item.discount < 0) throw new InvalidAmountError(`Invalid amount for discount on product ${item.product_id}`)
            if (item.quantity < 0) throw new InvalidAmountError(`Invalid amount for quantity on product ${item.product_id}`)
            const price = productPriceMap.get(item.product_id) || 0;
            const itemDiscount = item.discount || 0;
            const itemTax = 0;
            const itemShipping = 0;
            const itemTotal = (price * item.quantity)
            const itemPaid = Math.max(itemTotal - itemDiscount, 0)


            total_price += Math.max((itemTotal + itemTax + itemShipping) - itemDiscount, 0);
            total_discount += itemDiscount;
            total_shipping += itemShipping;
            total_tax += itemTax;

            return {
                product_id: item.product_id,
                quantity: item.quantity,
                discount: itemDiscount,
                paid: itemPaid,
                tax: itemTax,
                shipping: itemShipping,
            };
        });


        const order = await Order.query().insertGraph({
            customer_id,
            total_paid: total_price,
            total_discount,
            total_shipping,
            total_tax,
            items: orderItemsData,
            status: OrderStatus.PaymentPending
        })

        return reply.code(201).send(order);
    } catch (error) {
        
        if (error instanceof InvalidAmountError) {
            return reply.code(400).send(error);
        }
        if (error instanceof NotFoundError) {
            return reply.code(400).send({message: error.message});
        }
        return reply.send(error);
    };
}




