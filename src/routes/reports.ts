import { FastifyInstance } from "fastify";
import totalSoldByDateAndProduct from "../actions/reports/sales/list";
import { salesReportSchema } from "../schema/reports";

export default async function reportRoutes(server: FastifyInstance) {
  server.get('/sales', { schema: { querystring: salesReportSchema } }, totalSoldByDateAndProduct);
}
