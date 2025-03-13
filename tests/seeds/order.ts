import { OrderStatus, Product } from "src/models";
import { products } from "./products";
import { OrderAttributes } from "src/models/Order";
import { faker } from '@faker-js/faker'
import { OrderItemAttributes } from "src/models/OrderItem";

export function seedRandomOrders(numberOfOrders: number): OrderAttributes[] {
    const productsMap = new Map<number, number>(products.map((product, index) => [index + 1, product.price]));
    const orders: OrderAttributes[] = [];

    for (let i = 0; i < numberOfOrders; i++) {
        const orderItems: OrderItemAttributes[] = [];
        const numberOfProducts = Math.floor(Math.random() * 5) + 1;

        const availableProductIds = Array.from(productsMap.keys());
        for (let j = 0; j < numberOfProducts; j++) {
            const randomIndex = Math.floor(Math.random() * availableProductIds.length);
            const productId = availableProductIds[randomIndex];
            const quantity = Math.floor(Math.random() * 5) + 1;
            const productCost = productsMap.get(productId) || 0;
            const discount = Math.floor(Math.random() * productCost);

            orderItems.push({
                product_id: productId,
                quantity,
                paid: productCost * quantity - discount,
                discount,
                tax: 0,
                shipping: 0,
            });

            availableProductIds.splice(randomIndex, 1);
        }

        const totalAmount = orderItems.reduce((sum, item) => {
            return sum + (productsMap.get(item.product_id) || 0) * item.quantity;
        }, 0);
        const total_discount = Math.floor(Math.random() * totalAmount);
        const total_paid = totalAmount - total_discount;
        const total_shipping = 0;
        const total_tax = 0;

        const statuses: OrderStatus[] = Object.values(OrderStatus);
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        orders.push({
            customer_id: Math.floor(Math.random() * 100) + 1,
            status,
            total_discount,
            total_paid,
            total_shipping,
            total_tax,
            items: orderItems,
            created_at: faker.date.between({
                from: new Date('2021-01-01'),
                to: new Date(),
            }).toISOString(),
        });
    }

    return orders;
}
