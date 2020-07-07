import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';
import AppError from '@shared/errors/AppError';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;

    const createCustomerService = container.resolve(CreateCustomerService);

    if (!name && !email) {
      throw new AppError('Missing parameters', 422);
    }

    const customer = await createCustomerService.execute({ name, email });
    return response.json(customer);
  }
}
