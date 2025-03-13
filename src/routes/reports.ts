import { FastifyInstance } from "fastify";
import totalSoldByDateAndProduct from "../actions/reports/sales/list";

export default async function reportRoutes(server: FastifyInstance) {
  server.get('/sales', totalSoldByDateAndProduct);
}
