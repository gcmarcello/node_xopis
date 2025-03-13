import { OrderItem } from "src/models";

export async function listSalesByDayAndProduct({start_date, end_date, product_id}:{start_date: string, end_date: string, product_id?: string}) {
    const itemsSold = await OrderItem.query().whereBetween('created_at', [start_date, end_date])

    return itemsSold
}
