import { Module } from '@nestjs/common';
// TODO: import PrismaModule của nhóm nếu PrismaService chưa là @Global
import { OrderLifecycleService } from './order-lifecycle.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentProcessorService } from './payment-processor.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderLifecycleService, PaymentProcessorService],
  // TV4 import OrdersModule vào PaymentsModule để dùng PaymentProcessorService
  exports: [OrdersService, OrderLifecycleService, PaymentProcessorService],
})
export class OrdersModule {}
