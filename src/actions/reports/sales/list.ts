import { FastifyReply, FastifyRequest } from "fastify";
import { listSalesByDayAndProduct } from "../../../services/reports.service";
import { SalesReportSchema } from "src/schema/reports";

type Request = FastifyRequest<{
    Querystring: SalesReportSchema
}>;

export default async ({ query: { start_date,
    end_date,
    product_id } }: Request,
    reply: FastifyReply
) => {
    try {
        const report = await listSalesByDayAndProduct({
            start_date,
            end_date,
            product_id: Number(product_id)
        })
        return reply.send(report);
    } catch (error) {
        return reply.send(error);
    }
}
