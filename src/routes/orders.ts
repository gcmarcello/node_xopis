import { FastifyInstance } from "fastify";
import orderUpsert from "../actions/orders/upsert";

export default async function orderRoutes(server: FastifyInstance) {
    server.post('/', orderUpsert);
}
