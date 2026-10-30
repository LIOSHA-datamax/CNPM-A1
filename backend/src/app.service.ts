import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      status: 'success',
      message: 'Hello World! BrewLite API is running.',
      project: 'BrewLite - Digital Coffee & Cashless Payment',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/api/docs',
        products: '/api/products',
        ordersMe: '/api/orders/me',
      },
    };
  }
}
