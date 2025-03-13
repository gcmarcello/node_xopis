import { SalesReportSchema,  } from "src/schema/reports";
import { Order, OrderItem, Product } from "../models";

export async function fetchItemsByDayAndProduct({ start_date, end_date, product_id }: SalesReportSchema) {
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

    return itemsSold
}

export async function reportSalesByDayAndProduct(itemsSold: OrderItem[]) {
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

export async function reportTopProducts(
    itemsSold: OrderItem[],
    breakdown = false
  ) {
    if (breakdown) {
      const dateMap = new Map<string, Map<number, number>>();
  
      for (const item of itemsSold) {
        const date = item.created_at!.split('T')[0];
  
        if (!dateMap.has(date)) {
          dateMap.set(date, new Map<number, number>());
        }
  
        const productMap = dateMap.get(date)!;
        const currentCount = productMap.get(item.product_id) ?? 0;
        productMap.set(item.product_id, currentCount + item.quantity);
      }
  
      const breakdownResults = [];
  
      for (const [date, productMap] of dateMap.entries()) {
        const sortedItems = Array.from(productMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([product_id, total_purchases]) => ({
            product_id,
            date,
            total_purchases,
          }));
  
        breakdownResults.push(...sortedItems);
      }
  
      return breakdownResults;
    } else {
      
      const productMap = new Map<number, number>();
  
      for (const item of itemsSold) {
        const currentCount = productMap.get(item.product_id) ?? 0;
        productMap.set(item.product_id, currentCount + item.quantity);
      }
  
      return Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([product_id, total_purchases]) => ({ product_id, total_purchases }));
    }
  }
