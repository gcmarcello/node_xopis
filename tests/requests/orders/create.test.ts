import 'tests/setup';
import server from 'src/server';
import Product from 'src/models/Product';
import { LightMyRequestResponse } from 'fastify';
import { Order, OrderItem, OrderStatus } from 'src/models';

describe('CREATE action', () => {
    const item1 = new OrderItem();
    item1.product_id = 1;
    item1.quantity = 2;
    item1.discount = 0;

    const item2 = new OrderItem();
    item2.product_id = 2;
    item2.quantity = 1;
    item2.discount = 5;

    const validInput: Partial<Order> = {
        "customer_id": 1,
        "items": [
            item1,
            item2
        ]
    }

    beforeEach(async () => {
        await createBeachBallProduct();
        await createFishingRodProduct();
        await createConsoleProduct();
    })



    describe('when the input is valid', () => {
        const input = validInput;

        it('creates a new record', async () => {
            await assertCount(input, { changedBy: 1 });
        });

        it('is successful', async () => {
            const response = await makeRequest(input);
            expect(response.statusCode).toBe(201);
        });

        it('returns the created order', async () => {
            const response = await makeRequest(input);
            const jsonResponse = response.json<Order>();
            expect(jsonResponse).toEqual(
                expect.objectContaining({
                    "customer_id": 1,
                    "id": 1,
                    "total_paid": ((2.99 * 2) + 50) - 5,
                    "total_tax": 0,
                    "total_shipping": 0,
                    "total_discount": 5,
                    "status": "payment_pending",
                    "items": [
                        {
                            "id": 1,
                            "order_id": 1,
                            "product_id": 1,
                            "quantity": 2,
                            "tax": 0,
                            "shipping": 0,
                            "discount": 0,
                            "paid": 2.99 * 2 - 0
                        },
                        {
                            "id": 2,
                            "order_id": 1,
                            "product_id": 2,
                            "quantity": 1,
                            "tax": 0,
                            "shipping": 0,
                            "discount": 5,
                            "paid": 50 * 1 - 5
                        }
                    ]
                })
            );
        });
    });

    describe('when the customer_id is missing', () => {
        const { customer_id, ...input } = validInput;

        it('does not create a new record', async () => {
            await assertCount(input, { changedBy: 0 });
        });

        it('returns a bad request response', async () => {
            const response = await makeRequest(input);

            await assertBadRequest(response, /must have required property 'customer_id'/);
        });
    })

    describe('when items are missing', () => {
        const { items, ...input } = validInput;

        it('creates a new record', async () => {
            await assertCount(input, { changedBy: 1 });
        });

        it('is successful', async () => {
            const response = await makeRequest(input);
            expect(response.statusCode).toBe(201);
        });

        it('returns the created order', async () => {
            const response = await makeRequest(input);
            const jsonResponse = response.json<Order>();
            expect(jsonResponse).toEqual(
                expect.objectContaining({
                    "customer_id": 1,
                    "id": 1,
                    "total_paid": 0,
                    "total_tax": 0,
                    "total_shipping": 0,
                    "total_discount": 0,
                    "status": "payment_pending",
                    "items": []
                })
            );
        });
    })

    describe('when item has a larger discount than its product price', () => {
        const itemWithDiscountLargerThanValue = new OrderItem()
        itemWithDiscountLargerThanValue.product_id = 2
        itemWithDiscountLargerThanValue.quantity = 1
        itemWithDiscountLargerThanValue.discount = 200;

        const validInput: Partial<Order> = {
            "customer_id": 1,
            "items": [
                itemWithDiscountLargerThanValue
            ]
        }

        const input = validInput



        it('does not create a new record', async () => {
            await assertCount(input, { changedBy: 0 });
        });

        it('returns a bad request response', async () => {
            const response = await makeRequest(input);

            await assertBadRequest(response, /Discount amount cannot be greater than total cost for product/);
        });
    })

    describe('when item has a negative quantity', () => {
        const itemWithNegativeDiscount = new OrderItem()
        itemWithNegativeDiscount.product_id = 1
        itemWithNegativeDiscount.quantity = -1
        itemWithNegativeDiscount.discount = 0;

        const validInput: Partial<Order> = {
            "customer_id": 1,
            "items": [
                itemWithNegativeDiscount
            ]
        }

        const input = validInput

        it('does not create a new record', async () => {
            await assertCount(input, { changedBy: 0 });
        });

        it('returns a bad request response', async () => {
            const response = await makeRequest(input);

            await assertBadRequest(response, /Invalid amount for quantity on product 1/);
        });
    })

    describe('when item has a negative discount', () => {
        const itemWithNegativeDiscount = new OrderItem()
        itemWithNegativeDiscount.product_id = 1
        itemWithNegativeDiscount.quantity = 1
        itemWithNegativeDiscount.discount = -1;

        const validInput: Partial<Order> = {
            "customer_id": 1,
            "items": [
                itemWithNegativeDiscount
            ]
        }

        const input = validInput

        it('does not create a new record', async () => {
            await assertCount(input, { changedBy: 0 });
        });

        it('returns a bad request response', async () => {
            const response = await makeRequest(input);
            await assertBadRequest(response, /Invalid amount for discount on product 1/);
        });
    })

    describe('when product does not exist', () => {
        const itemWithNegativeDiscount = new OrderItem()
        itemWithNegativeDiscount.product_id = 100
        itemWithNegativeDiscount.quantity = 1
        itemWithNegativeDiscount.discount = 0;

        const validInput: Partial<Order> = {
            "customer_id": 1,
            "items": [
                itemWithNegativeDiscount
            ]
        }

        const input = validInput

        it('does not create a new record', async () => {
            await assertCount(input, { changedBy: 0 });
        });

        it('returns a bad request response', async () => {
            const response = await makeRequest(input);
            await assertBadRequest(response, /Product not found/);
        });
    })

    describe('when updating order status with valid info', () => {
        const input: Partial<Order> = {
            "customer_id": 1,
            "items": [
                item1,
                item2
            ]
        }
        it('does not create a new record', async () => {
            await makeRequest(input);
            await assertCount({ ...input, status: OrderStatus.Approved, id: 1 }, { changedBy: 0 });
        });

        it('is successful', async () => {
            await makeRequest(input);
            const response = await makeRequest({ ...input, status: OrderStatus.Approved, id: 1 });
            expect(response.statusCode).toBe(201);
            expect(response.json<Order>().status).toBe('approved');
        })
    })

    describe('when updating order customer_id with valid info', () => {
        const input: Partial<Order> = {
            "customer_id": 1,
            "items": [
                item1,
                item2
            ]
        }
        it('does not create a new record', async () => {
            await makeRequest(input);
            await assertCount({ ...input, customer_id: 2, id: 1 }, { changedBy: 0 });
        });

        it('is successful', async () => {
            await makeRequest(input);
            const response = await makeRequest({ ...input, customer_id: 2, id: 1 });
            expect(response.statusCode).toBe(201);
            expect(response.json<Order>().customer_id).toBe(2);
        })
    });

    describe('when updating order items inserting a new product', () => {
        const input: Partial<Order> = {
            "customer_id": 1,
            "items": [
                item1,
                item2
            ]
        }
        it('does not create a new order record', async () => {
            await makeRequest(input);
            const newItem = new OrderItem({ product_id: 3, discount: 0, quantity: 1 });
            await assertCount({ ...input, id: 1, items: [item1, item2, newItem] }, { changedBy: 0 });
        });

        it('creates a new orderItem record', async () => {
            await makeRequest(input);
            const newItem = new OrderItem({ product_id: 3, discount: 0, quantity: 1 });
            await assertCountOrderItems({ ...input, id: 1, items: [item1, item2, newItem] }, { changedBy: 1 });
        });

        it('is successful', async () => {
            await makeRequest(input);
            const newItem = new OrderItem({ product_id: 3, discount: 0, quantity: 1 });
            const response = await makeRequest({ ...input, id: 1, items: [item1, item2, newItem] });

            expect(response.statusCode).toBe(201);
            expect(response.json<Order>().total_paid).toBe((2.99 * 2 - 0) + (50 * 1 - 5) + (1000 * 1 - 0));
            expect(response.json<Order>().items).toStrictEqual([{
                "discount": 0,
                "id": 1,
                "order_id": 1,
                "paid": 5.98,
                "product_id": 1,
                "quantity": 2,
                "shipping": 0,
                "tax": 0,
            },
            {
                "discount": 5,
                "id": 2,
                "order_id": 1,
                "paid": 45,
                "product_id": 2,
                "quantity": 1,
                "shipping": 0,
                "tax": 0,
            },
            {
                "discount": 0,
                "id": 3,
                "order_id": 1,
                "paid": 1000,
                "product_id": 3,
                "quantity": 1,
                "shipping": 0,
                "tax": 0,
            }]);
        })
    })

    describe('when updating order items deleting a product', () => {
        const input: Partial<Order> = {
            "customer_id": 1,
            "items": [
                item1,
                item2
            ]
        }
        it('does not create a new order record', async () => {
            await makeRequest(input);
            await assertCount({ ...input, id: 1, items: [item1] }, { changedBy: 0 });
        });

        it('removes a orderItem record', async () => {
            await makeRequest(input);
            await assertCountOrderItems({ ...input, id: 1, items: [item1] }, { changedBy: -1 });
        });

        it('is successful', async () => {
            await makeRequest(input);
            const response = await makeRequest({ ...input, id: 1, items: [item1] });

            expect(response.statusCode).toBe(201);
            expect(response.json<Order>().total_paid).toBe(5.98);
            expect(response.json<Order>().items).toStrictEqual([{
                "discount": 0,
                "id": 1,
                "order_id": 1,
                "paid": 5.98,
                "product_id": 1,
                "quantity": 2,
                "shipping": 0,
                "tax": 0,
            }]);
        })
    })

    describe('when updating order items updating a product "in place"', () => {
        const input: Partial<Order> = {
            "customer_id": 1,
            "items": [
                item1,
                item2
            ]
        }
        it('does not create a new order record', async () => {
            await makeRequest(input);
            const newItem = new OrderItem({ product_id: 3, discount: 0, quantity: 1 });
            await assertCount({ ...input, id: 1, items: [item1, newItem] }, { changedBy: 0 });
        });

        it('does not create any orderItem record', async () => {
            await makeRequest(input);
            const newItem = new OrderItem({ product_id: 3, discount: 0, quantity: 1 });
            await assertCountOrderItems({ ...input, id: 1, items: [item1, newItem] }, { changedBy: 0 });
        });

        it('is successful', async () => {
            await makeRequest(input);
            const newItem = new OrderItem({ product_id: 3, discount: 0, quantity: 1 });
            const response = await makeRequest({ ...input, id: 1, items: [item1, newItem] });

            expect(response.statusCode).toBe(201);
            expect(response.json<Order>().total_paid).toBe((2.99 * 2 - 0) + (1000 * 1 - 0));
            expect(response.json<Order>().items).toStrictEqual([{
                "discount": 0,
                "id": 1,
                "order_id": 1,
                "paid": 5.98,
                "product_id": 1,
                "quantity": 2,
                "shipping": 0,
                "tax": 0,
            },
            {
                "discount": 0,
                "id": 3,
                "order_id": 1,
                "paid": 1000,
                "product_id": 3,
                "quantity": 1,
                "shipping": 0,
                "tax": 0,
            }]);
        })
    })

    describe('when updating an non-existing order', () => {
        const input: Partial<Order> = {
            "id": 100,
            "customer_id": 1,
            "items": [
                item1,
                item2
            ]
        }
        it('does not create a new order record', async () => {
            await assertCount(input, { changedBy: 0 });
        });

        it('does not create any orderItem record', async () => {
            await assertCountOrderItems(input, { changedBy: 0 });
        });

        it('returns a bad request response', async () => {
            const response = await makeRequest(input);

            await assertBadRequest(response, /root model \(id=100\) does not exist\. If you want to insert it with an id, use the insertMissing option/);
        });
    })

    const makeRequest = async (input: Partial<Order>) =>
        server.inject({
            method: 'POST',
            url: '/orders',
            body: input,
        });

    const countRecords = async () =>
        Order.query().resultSize();

    const countOrderItems = async (orderId: number) =>
        OrderItem.query().where('order_id', orderId).resultSize();

    const assertCount = async (input: Partial<Order>, { changedBy }: { changedBy: number }) => {
        const initialCount = await countRecords();

        await makeRequest(input);

        const finalCount = await countRecords();

        expect(finalCount).toBe(initialCount + changedBy);
    };

    const assertCountOrderItems = async (input: Partial<Order>, { changedBy }: { changedBy: number }) => {
        if (!input.id) throw new Error('Order id is required');
        const initialCount = await countOrderItems(input.id);

        const req = await makeRequest(input);
        const finalCount = await countOrderItems(input.id);

        expect(finalCount).toBe(initialCount + changedBy);
    };

    const assertBadRequest = async (response: LightMyRequestResponse, message: RegExp | string) => {
        const json_response = response.json<{ message: string }>();
        expect(response.statusCode).toBe(400);
        expect(json_response.message).toMatch(message);
    };

    const createBeachBallProduct = async () =>
        await Product.query()
            .insert({
                name: 'Beach Ball',
                sku: 'BCHBLL',
                description: 'Fun for the whole family',
                price: 2.99,
                stock: 100,
            });

    const createFishingRodProduct = async () =>
        await Product.query()
            .insert({
                name: 'Fish Rod',
                sku: 'FSHRD',
                description: 'Fun for the whole family',
                price: 50,
                stock: 100,
            });

    const createConsoleProduct = async () =>
        await Product.query()
            .insert({
                name: 'Console',
                sku: 'CONSL',
                description: 'Fun for the whole family',
                price: 1000,
                stock: 100,
            });
});
