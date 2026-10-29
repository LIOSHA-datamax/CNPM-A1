import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPayment(
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') headerIdempotencyKey?: string,
    @CurrentUser() user?: { id: string; sub: string; role: string },
  ) {
    return this.paymentsService.processPayment(
      dto,
      headerIdempotencyKey,
      user?.id || user?.sub,
    );
  }

  @Get('order/:orderId')
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user?: { id: string; sub: string; role: string },
  ) {
    return this.paymentsService.findByOrder(
      orderId,
      user?.id || user?.sub,
      user?.role,
    );
  }
}
