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
        if (item.quantity < 0) throw new InvalidAmountError(`Invalid amount for quantity on product ${item.product_id}`)

        total_paid += Math.max((itemTotal + itemTax + itemShipping) - itemDiscount, 0);
        total_discount += itemDiscount;
        total_shipping += itemShipping;
        total_tax += itemTax;
    }

    return { total_paid, total_discount, total_shipping, total_tax };
}

export async function createOrder(
    { customer_id, total_discount, total_paid, total_shipping, total_tax, status }: OrderAttributes,
    productPriceMap: Map<number, number>,
    orderItems: OrderItemAttributes[],
) {
    return await Order.transaction(async (trx) => {
        const order = await Order.query(trx).insert({
            customer_id,
            total_paid,
            total_discount,
            total_shipping,
            total_tax,
            status: status ?? OrderStatus.PaymentPending
        });

        const orderItemsData = generateOrderItems(orderItems, order, productPriceMap);

        const items = orderItemsData.length ? await OrderItem.knex()
            .batchInsert("orders_items", orderItemsData, 100)
            .transacting(trx)
            // as any needed due to a bug in objection types
            .returning(['discount', 'id', 'order_id', 'paid', 'product_id', 'quantity', 'shipping', 'tax'] as any[]) : [];

        return { ...order, items }
    })
}
