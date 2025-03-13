import { Model } from 'objection';
import Order, { OrderStatus } from './Order';
import Product from './Product';

export type OrderItemAttributes = {
  id?: number;
  status: OrderStatus;
  order_id: number;
  product_id: number;
  quantity: number;
  tax: number;
  shipping: number;
  discount: number;
  paid: number;
  created_at?: Date;
  updated_at?: Date;
}

class OrderItem extends Model {
  static tableName = 'orders_items';

  id?: number;
  status!: OrderStatus;
  order_id!: number;
  product_id!: number;
  quantity!: number;
  tax: number = 0;
  discount: number = 0;
  paid!: number;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<OrderItemAttributes>) {
    super();
    Object.assign(this, data || {});
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['order_id', 'product_id', 'quantity', 'tax', 'shipping', 'discount', 'paid'],
      properties: {
        id: { type: 'integer' },
        order_id: { type: 'integer' },
        product_id: { type: 'integer' },
        quantity: { type: 'integer', minimum: 1 },
        tax: { type: 'number', minimum: 0 },
        shipping: { type: 'number', minimum: 0 },
        discount: { type: 'number', minimum: 0 },
        paid: { type: 'number', minimum: 0 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    return {
      order: {
        relation: Model.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: 'orders_items.order_id',
          to: 'orders.id',
        }
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {

          from: 'orders_items.product_id',
          to: 'products.id',
        }
      }
    };
  }
}

export default OrderItem;
