import { OrderItem } from "src/models";
import { OrderItemAttributes } from "src/models/OrderItem";

export function generateOrderItemsSchema() {
    const items = [];
    const numItems = Math.floor(Math.random() * 10) + 1;
    

    for (let i = 0; i < numItems; i++) {
        const product_id = Math.floor(Math.random() * 100) + 1;
        const quantity = Math.floor(Math.random() * 10) + 1;
        const discount = Math.floor(Math.random());

        items.push({
            product_id,
            quantity,
            discount,
        });
    }

    return items;
}

export function generateOrderItemsGraph(items: OrderItemAttributes[], productPriceMap: Map<number, number>) {
    const numItems = Math.floor(Math.random() * 10) + 1;

    
    return items.map(item => {
        const price = productPriceMap.get(item.product_id) || 0;
        const itemTotal = (price * item.quantity)
        const itemDiscount = item.discount || 0;
        const itemPaid = Math.max(itemTotal - itemDiscount, 0)
        const itemTax = 0;
        const itemShipping = 0;

        return new OrderItem({
            product_id: item.product_id,
            quantity: item.quantity,
            discount: itemDiscount,
            paid: itemPaid,
            tax: itemTax,
            shipping: itemShipping,
        })
    });
}
