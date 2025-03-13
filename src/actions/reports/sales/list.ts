import { FastifyReply, FastifyRequest } from "fastify";
import { listSalesByDayAndProduct } from "../../../services/reports.service";

type Request = FastifyRequest<{
    Querystring: {
        start_date: string;
        end_date: string;
        product_id?: number;
    }
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
