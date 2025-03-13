import { OrderItem, Product } from "../models";

export async function listSalesByDayAndProduct({ start_date, end_date, product_id }: { start_date: string, end_date: string, product_id?: number }) {
    const itemsSold = product_id ?
        await OrderItem.query().where('product_id', product_id).whereBetween('created_at', [start_date, end_date]) :
        await OrderItem.query().whereBetween('created_at', [start_date, end_date])
        
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
