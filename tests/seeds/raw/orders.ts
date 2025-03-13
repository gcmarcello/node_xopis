import { OrderStatus } from "src/models";

export const ordersForTopProductsTest = [
    {
        "customer_id": 2,
        "status": OrderStatus.Approved,
        "total_paid": 0,
        "total_discount": 0,
        "total_shipping": 0,
        "total_tax": 0,
        "items": [
            {
                "product_id": 10,
                "quantity": 2,
                "paid": 0,
                "discount": 5,
                "created_at": "2022-09-01T00:00:00.000Z"
            }
        ],
        "created_at": "2022-09-01T00:00:00.000Z"
    },
    {
        "customer_id": 3,
        "status": OrderStatus.Approved,
        "total_paid": 0,
        "total_discount": 0,
        "total_shipping": 0,
        "total_tax": 0,
        "items": [
            {
                "product_id": 10,
                "quantity": 2, "paid": 0,
                "discount": 0,
                "created_at": "2022-09-02T00:00:00.000Z"
            }
        ],
        "created_at": "2022-09-02T00:00:00.000Z"
    },
    {
        "customer_id": 3,
        "status": OrderStatus.Approved,
        "total_paid": 0,
        "total_discount": 0,
        "total_shipping": 0,
        "total_tax": 0,
        "items": [
            {
                "product_id": 1,
                "quantity": 2, "paid": 0,
                "discount": 0,
                "created_at": "2022-09-03T00:00:00.000Z"
            }
        ],
        "created_at": "2022-09-03T00:00:00.000Z"
    },
    {
        "customer_id": 3,
        "status": OrderStatus.PaymentPending,
        "total_paid": 0,
        "total_discount": 0,
        "total_shipping": 0,
        "total_tax": 0,
        "items": [
            {
                "product_id": 10,
                "quantity": 2, "paid": 0,
                "discount": 0,
                "created_at": "2022-09-04T00:00:00.000Z",
            },
            {
                "product_id": 9,
                "quantity": 2, "paid": 0,
                "discount": 0,
                "created_at": "2022-09-04T00:00:00.000Z",
            }
        ],
        "created_at": "2022-09-04T00:00:00.000Z"
    },
    {
        "customer_id": 3,
        "status": OrderStatus.Approved,
        "total_paid": 0,
        "total_discount": 0,
        "total_shipping": 0,
        "total_tax": 0,
        "items": [
            {
                "product_id": 5,
                "quantity": 2,
                "paid": 0,
                "discount": 0,
                "created_at": "2022-09-05T00:00:00.000Z"
            }
        ],
        "created_at": "2022-09-05T00:00:00.000Z"
    }]

export const expectedTopProducts = [{ "product_id": 10, "total_purchases": 4 }, { "product_id": 1, "total_purchases": 2 }, { "product_id": 5, "total_purchases": 2 }]

export const expectedTopProductsWithBreakdown = [
    { "product_id": 10, "date": "2022-09-01", "total_purchases": 2 },
    { "product_id": 10, "date": "2022-09-02", "total_purchases": 2 },
    { "product_id": 1, "date": "2022-09-03", "total_purchases": 2 },
    { "product_id": 5, "date": "2022-09-05", "total_purchases": 2 }]  
