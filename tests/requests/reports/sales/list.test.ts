import 'tests/setup';
import { Order, Product } from "src/models";
import server from "src/server";
import { products } from 'tests/seeds/raw/products';
import { seedRandomOrders } from 'tests/seeds/order';
import { error } from 'console';

describe('SALES REPORT action', () => {
    beforeAll(async () =>
        await Product
            .knex().batchInsert('products', products)
    )

    describe('when the input is valid', () => {
        it('returns a list of sales', async () => {
            const ordersData = seedRandomOrders(10)
            await Order.query().insertGraphAndFetch(ordersData)

            const start_date = new Date('2021-09-01').toISOString();
            const end_date = new Date('2025-09-03').toISOString();

            const filteredOrders = ordersData.filter(order =>
                order.created_at! >= start_date
                && order.created_at! <= end_date
                && order.status === 'approved')



            const expectedItems = filteredOrders.flatMap(order => order.items).map(item => {
                const product = products.find((product) => product.id === item?.product_id)
                if (!product) return null
                return {
                    product_id: item?.product_id,
                    quantity: item?.quantity,
                    total_sold: (item?.quantity || 0) * product.price - (item?.discount || 0)
                }
            })

            const request = await makeRequest({
                start_date,
                end_date,
            })

            expect(request.statusCode).toBe(200);

            const responseData = request.json();

            expect(responseData).toStrictEqual(expectedItems);
        });
    });

    describe('when the input is valid with product_id', () => {
        it('returns a list of sales', async () => {
            const ordersData = seedRandomOrders(10)
            await Order.query().insertGraphAndFetch(ordersData)

            const start_date = new Date('2021-09-01').toISOString();
            const end_date = new Date('2025-09-03').toISOString();

            const filteredOrders = ordersData.filter(order =>
                order.created_at! >= start_date
                && order.created_at! <= end_date
                && order.status === 'approved')



            const expectedItems = filteredOrders.flatMap(order => order.items).filter(item => item?.product_id === 1).map(item => {
                const product = products.find((product, index) => index + 1 === item?.product_id)
                if (!product) return null
                return {
                    product_id: item?.product_id,
                    quantity: item?.quantity,
                    total_sold: (item?.quantity || 0) * product.price - (item?.discount || 0)
                }
            })

            const request = await makeRequest({
                start_date,
                end_date,
                product_id: 1
            })

            expect(request.statusCode).toBe(200);

            const responseData = request.json();

            expect(responseData).toStrictEqual(expectedItems);
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
            url: '/reports/sales',
            query
        });

})
