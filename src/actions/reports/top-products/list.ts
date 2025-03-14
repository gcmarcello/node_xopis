import { FastifyReply, FastifyRequest } from "fastify";
import { SalesReportSchema, TopProductsSchema } from "src/schema/reports";
import { fetchItemsByDayAndProduct, reportSalesByDayAndProduct, reportTopProducts } from "../../../services/reports.service";

type Request = FastifyRequest<{
    Querystring: TopProductsSchema
}>;

export default async ({ query: { start_date,
    end_date,
    breakdown } }: Request,
    reply: FastifyReply
) => {
    try {
        const items = await fetchItemsByDayAndProduct({
            start_date,
            end_date,
        })

        const report = await reportTopProducts(items, breakdown);
        return reply.send(report);
    } catch (error) {
        return reply.send(error);
    }
}
