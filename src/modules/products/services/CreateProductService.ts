import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const checkIfNameAlreadyExists = await this.productsRepository.findByName(
      name,
    );
    if (checkIfNameAlreadyExists) {
      throw new AppError('Product already registed');
    }
    const product = await this.productsRepository.create({
      name,
      price,
      quantity,
    });
    return product;
  }
}

export default CreateProductService;
