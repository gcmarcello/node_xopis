import { Order } from "src/models";
import OrderItem, { OrderItemAttributes } from "../models/OrderItem";

export function generateOrderItems(items: OrderItemAttributes[], order: Order, productPriceMap: Map<number, number>) {
    return items.map(item => {
        const price = productPriceMap.get(item.product_id) || 0;
        const itemTotal = (price * item.quantity)
        const itemDiscount = item.discount || 0;
        const itemPaid = Math.max(itemTotal - itemDiscount, 0)
        const itemTax = 0;
        const itemShipping = 0;

        return new OrderItem({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            discount: itemDiscount,
            paid: itemPaid,
            tax: itemTax,
            shipping: itemShipping,
        })
    });
}
