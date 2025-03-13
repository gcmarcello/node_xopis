import { OrderStatus, Product } from "src/models";

import { faker } from '@faker-js/faker';
import { calculateOrderTotals } from "src/services/orders.service";
import { generateOrderItems } from "src/services/orderItems.service";
import { generateOrderItemsGraph, generateOrderItemsSchema } from "./orderItems";


export async function generateOrders(numOrders: number) {
    const orders = [];
    const now = new Date();
    const oneYearAgo = new Date(now).setFullYear(now.getFullYear() - 1);
    const products = await Product.query()
    const productMap = new Map(products.map(p => [p.id, p.price]));

    for (let i = 0; i < numOrders; i++) {
        const itemsSchema = generateOrderItemsSchema()
        const { total_discount, total_paid, total_shipping, total_tax } = calculateOrderTotals(itemsSchema, productMap);
        const items = generateOrderItemsGraph(itemsSchema, productMap);

        const order = {
            customer_id: Math.floor(Math.random() * 1000) + 1,
            status: Math.random() > 0.5 ? OrderStatus.PaymentPending : OrderStatus.Approved,
            items,
            created_at: faker.date.between({ from: oneYearAgo, to: now }).toISOString(),
            total_discount,
            total_paid,
            total_shipping,
            total_tax
        };

        orders.push(order);
    }

    return orders;
}
