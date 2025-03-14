import 'tests/setup';
import { Order, OrderStatus, Product } from "src/models";
import server from "src/server";
import { products } from 'tests/seeds/raw/products';
import { seedRandomOrders } from 'tests/seeds/order';
import { expectedTopProducts, expectedTopProductsWithBreakdown, ordersForTopProductsTest } from 'tests/seeds/raw/orders';

describe('TOP PRODUCTS REPORT action', () => {
    beforeAll(async () =>
        await Product
            .knex().batchInsert('products', products)
    )

    describe('when the input is valid', () => {
        it('returns a list of sales', async () => {
            await Order.query().insertGraphAndFetch(ordersForTopProductsTest)
            const start_date = new Date('2021-09-01').toISOString();
            const end_date = new Date('2025-09-03').toISOString();
            const request = await makeRequest({
                start_date,
                end_date,
            })

            expect(request.statusCode).toBe(200);

            const responseData = request.json();

            expect(responseData).toStrictEqual(expectedTopProducts);

        });
    });

    describe('when the input is valid with breakdown', () => {
        it('returns a list of sales', async () => {
            await Order.query().insertGraphAndFetch(ordersForTopProductsTest)
            const start_date = new Date('2021-09-01').toISOString();
            const end_date = new Date('2025-09-03').toISOString();
            const request = await makeRequest({
                start_date,
                end_date,
                breakdown: true
            })

            expect(request.statusCode).toBe(200);

            const responseData = request.json();

            expect(responseData).toStrictEqual(expectedTopProductsWithBreakdown);

        });
    });

    describe('when the input is missing start_date', () => {
        it('returns a bad request', async () => {
            const end_date = new Date('2025-09-03').toISOString();
            const request = await makeRequest({
                end_date,
                product_id: 1
            })

            expect(request.statusCode).toBe(400);
            expect(request.json()).toStrictEqual({
                message: 'Validation failed',
                error: 'Bad Request',
                details: [
                    {
                        "field": "start_date",
                        "message": "Invalid date",
                    }
                ]
            })


        });
    });

    describe('when the input is missing end_date', () => {
        it('returns a bad request', async () => {
            const start_date = new Date('2025-09-03').toISOString();
            const request = await makeRequest({
                start_date,
                product_id: 1
            })

            expect(request.statusCode).toBe(400);
            expect(request.json()).toStrictEqual({
                message: 'Validation failed',
                error: 'Bad Request',
                details: [
                    {
                        "field": "end_date",
                        "message": "Invalid date",
                    }
                ]
            })


        });
    });




    const makeRequest = async (query: any) =>
        server.inject({
            method: 'GET',
            url: '/reports/top-products',
            query
        });

})
