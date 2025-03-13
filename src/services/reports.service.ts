import { Order, OrderItem, Product } from "../models";

export async function listSalesByDayAndProduct({ start_date, end_date, product_id }: { start_date: Date, end_date: Date, product_id?: number }) {
    const isoStartDate = start_date.toISOString()
    const isoEndDate = end_date.toISOString()

    const baseQuery = Order.query()
    .select('id')
    .whereBetween('created_at', [isoStartDate, isoEndDate])
    .where('status', 'approved');

    const itemsSold = product_id
    ? await Order.relatedQuery('items')
          .for(baseQuery)
          .where('product_id', product_id)
    : await Order.relatedQuery('items')
          .for(baseQuery);

    const uniqueProducts = new Set(itemsSold.map(item => item.product_id))

    const products = await Product.query().findByIds([...uniqueProducts])
    const productMap = new Map(products.map(product => [product.id, product]))

    const parsedItems = itemsSold.map(item => {
        const product = productMap.get(item.product_id)
        if (!product) return null
        return {
            product_id: item.product_id,
            quantity: item.quantity,
            total_sold: (item.quantity * product.price) + item.tax + item.shipping - item.discount,
        }
    })

    return parsedItems
}
