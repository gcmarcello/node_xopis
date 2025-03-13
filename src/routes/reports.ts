import { FastifyInstance } from "fastify";
import totalSoldByDateAndProduct from "../actions/reports/sales/list";
import topProducts from "../actions/reports/top-products/list";
import { salesReportSchema, topProductsSchema } from "../schema/reports";

export default async function reportRoutes(server: FastifyInstance) {
  server.get('/sales', { schema: { querystring: salesReportSchema } }, totalSoldByDateAndProduct);
  server.get('/top-products', { schema: { querystring: topProductsSchema } }, topProducts);
}
