import { OrderStatus, Product } from "src/models";
import { products } from "./raw/products";
import { OrderAttributes } from "src/models/Order";
import { faker } from '@faker-js/faker'
import { OrderItemAttributes } from "src/models/OrderItem";

export function seedRandomOrders(numberOfOrders: number): OrderAttributes[] {
    const orders: OrderAttributes[] = [];

    for (let i = 0; i < numberOfOrders; i++) {
        const orderItems: OrderItemAttributes[] = [];
        const numberOfProducts = faker.number.int({ min: 1, max: 5 });

        for (let j = 0; j < numberOfProducts; j++) {
            const randomIndex = faker.number.int({ min: 0, max: products.length - 1 });
            const productId = products[randomIndex].id;
            const quantity = faker.number.int({ min: 1, max: 5 });
            const productCost = products[randomIndex].price || 0;
            const discount = faker.number.int({ max: productCost });

            orderItems.push({
                product_id: productId,
                quantity,
                paid: productCost * quantity - discount,
                discount,
                tax: 0,
                shipping: 0,
            });
        }

        const totalAmount = orderItems.reduce((sum, item) => {
            return sum + (products.find(product => product.id === item.product_id)?.price || 0) * item.quantity;
        }, 0);
        const total_discount = faker.number.int({ max: totalAmount });
        const total_paid = totalAmount - total_discount;
        const total_shipping = 0;
        const total_tax = 0;

        const statuses: OrderStatus[] = Object.values(OrderStatus);
        const status = statuses[faker.number.int({ min: 0, max: statuses.length - 1 })];

        orders.push({
            customer_id: faker.number.int({ min: 1, max: 100 }),
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
