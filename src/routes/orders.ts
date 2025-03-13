import { FastifyInstance } from "fastify";
import orderUpsert from "../actions/orders/upsert";
import { upsertOrderSchema } from "../schema/orders";

export default async function orderRoutes(server: FastifyInstance) {
    server.post('/', { schema: { body: upsertOrderSchema } }, orderUpsert);
}
