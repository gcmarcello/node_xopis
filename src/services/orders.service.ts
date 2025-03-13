import { InvalidAmountError } from "../errors/invalidAmount";
import Order, { OrderAttributes, OrderStatus } from "../models/Order";
import OrderItem, { OrderItemAttributes } from "../models/OrderItem";
import { generateOrderItems } from "./orderItems.service";

export function calculateOrderTotals(orderItems: OrderItemAttributes[], productPriceMap: Map<number, number>) {
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
        if (item.discount && item.discount > itemTotal) throw new InvalidAmountError(`Discount amount cannot be greater than total cost for product ${item.product_id}`)
        if (item.quantity < 0) throw new InvalidAmountError(`Invalid amount for quantity on product ${item.product_id}`)

        total_paid += Math.max((itemTotal + itemTax + itemShipping) - itemDiscount, 0);
        total_discount += itemDiscount;
        total_shipping += itemShipping;
        total_tax += itemTax;
    }

    return { total_paid, total_discount, total_shipping, total_tax };
}

export async function upsertOrder(
    { customer_id, total_discount, total_paid, total_shipping, total_tax, status, id }: OrderAttributes,
    productPriceMap: Map<number, number>,
    orderItems: OrderItemAttributes[]
) {
    const returningRows = ['discount', 'id', 'order_id', 'paid', 'product_id', 'quantity', 'shipping', 'tax'] as any[]
    return await Order.transaction(async (trx) => {
        const order = await Order.query(trx).upsertGraph(
            {
                id,
                customer_id,
                total_paid,
                total_discount,
                total_shipping,
                total_tax,
                status: status ?? OrderStatus.PaymentPending
            }
        );

        const newOrderItems = generateOrderItems(orderItems, order, productPriceMap);

        if (!order.id) {
            const items = newOrderItems.length
                ? await OrderItem.knex()
                    .batchInsert("orders_items", newOrderItems)
                    .transacting(trx)
                    .returning(returningRows)
                : [];
            return { ...order, items };
        }

        const existingItems = await OrderItem.query(trx).where('order_id', order.id);
        const existingItemMap = new Map(existingItems.map(item => [item.product_id, item]));

        const upsertItems = newOrderItems.map(item => {
            const existingItem = existingItemMap.get(item.product_id);
            return existingItem ? { ...item, ...existingItem, updated_at: new Date() }
                : { ...item, created_at: new Date(), updated_at: new Date() };
        });

        await OrderItem.query(trx).delete().where('order_id', order.id);

        const items = await OrderItem.knex()
            .batchInsert("orders_items", upsertItems)
            .transacting(trx)
            .returning(returningRows);

        return { ...order, items };
    });
}
