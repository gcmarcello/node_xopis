import { Order } from "src/models";
import OrderItem, { OrderItemAttributes } from "../models/OrderItem";
import { isDeepStrictEqual } from "node:util";
import Objection from "objection";

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

export async function verifyIfItemsAreEqual(orderItems: OrderItemAttributes[], order_id: number, trx?: Objection.Transaction) {
    const existingItems = await OrderItem.query(trx).where('order_id', order_id).select(['product_id', 'quantity', 'discount', 'tax', 'shipping']);

    if(existingItems.length !== orderItems.length) return false;

    for (const item of orderItems) {
        const existingItem = existingItems.find(i => i.product_id === item.product_id);
        if (!existingItem) return false;
        const existingItemDetails = {
            quantity: existingItem.quantity,
            product_id: existingItem.product_id,
            discount: existingItem.discount,
            tax: existingItem.tax,
            shipping: existingItem.shipping
        }
        const newItem = {
            quantity: item.quantity,
            product_id: item.product_id,
            discount: item.discount ?? 0,
            tax: item.tax ?? 0,
            shipping: item.shipping ?? 0
        }
        if(!isDeepStrictEqual(existingItemDetails, newItem)) return false;
    }

    return true;
}
