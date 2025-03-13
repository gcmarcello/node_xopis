import { FastifyReply, FastifyRequest } from "fastify";
import { listSalesByDayAndProduct } from "src/services/reports.service";

type Request = FastifyRequest<{
    Body: {
        start_date: string;
        end_date: string;
        product_id?: string;
    }
}>;

export default async ({{ body: { start_date,
    end_date,
    product_id } }: Request,
    reply: FastifyReply}) => {
    try {
        return listSalesByDayAndProduct({
            start_date,
            end_date,
            product_id
        })
    } catch (error) {
        
    }
}
