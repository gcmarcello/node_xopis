import { NotFoundError } from "objection";
import { Product } from "../models";
import { type OrderItemAttributes } from "../models/OrderItem";

export async function findProductsFromOrderItems(orderItems: OrderItemAttributes[]): Promise<Product[]> {
    const products = await Product.query().findByIds(orderItems.map((item) => item.product_id));
    const missingProduct = orderItems.filter(item => !products.find(product => product.id === item.product_id));

    if (missingProduct.length) {
        throw new NotFoundError({ message: 'Product not found' + missingProduct.map(item => item.product_id).join(', ') });
    }

    return products;
}
