import fastify from 'fastify';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import 'dotenv/config';
import reportRoutes from './routes/reports';
import { errorHandler } from './plugins/errorHandler';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const shouldLog = process.env.NODE_ENV !== 'test';
const server = fastify({ logger: shouldLog });

server.register(userRoutes, { prefix: '/users' });
server.register(productRoutes, { prefix: '/products' });
server.register(orderRoutes, { prefix: '/orders' });
server.register(reportRoutes, { prefix: '/reports' });

server.setErrorHandler(errorHandler);
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

export default server;
