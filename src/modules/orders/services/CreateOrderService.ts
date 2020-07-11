import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findCustomer = await this.customersRepository.findById(customer_id);
    if (!findCustomer) {
      throw new AppError('Customer does not exists');
    }
    const findProducts = await this.productsRepository.findAllById(products);
    if (findProducts.length !== products.length) {
      throw new AppError('Some product were not found');
    }

    const formatedProducts = findProducts.map(product => {
      const getProductIndex = products.findIndex(
        item => item.id === product.id,
      );
      const receivedProduct = products[getProductIndex];
      if (receivedProduct.quantity > product.quantity) {
        throw new AppError(
          `Invalid quantity for product: ${receivedProduct.id}`,
        );
      }

      return {
        product_id: product.id,
        price: product.price,
        quantity: receivedProduct.quantity,
      };
    });
    await this.productsRepository.updateQuantity(products);

    const createOrder = await this.ordersRepository.create({
      customer: findCustomer,
      products: formatedProducts,
    });

    return createOrder;
  }
}

export default CreateOrderService;
