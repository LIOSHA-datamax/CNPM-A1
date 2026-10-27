import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPayment(
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') headerIdempotencyKey?: string,
  ) {
    return this.paymentsService.processPayment(dto, headerIdempotencyKey);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
