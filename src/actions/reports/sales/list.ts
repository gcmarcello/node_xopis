import { FastifyReply, FastifyRequest } from "fastify";
import { SalesReportSchema } from "src/schema/reports";
import { fetchItemsByDayAndProduct, reportSalesByDayAndProduct } from "../../../services/reports.service";

type Request = FastifyRequest<{
    Querystring: SalesReportSchema
}>;

export default async ({ query: { start_date,
    end_date,
    product_id } }: Request,
    reply: FastifyReply
) => {
    try {
        const items = await fetchItemsByDayAndProduct({
            start_date,
            end_date,
            product_id: Number(product_id)
        })

        const report = await reportSalesByDayAndProduct(items);
        return reply.send(report);
    } catch (error) {
        return reply.send(error);
    }
}
