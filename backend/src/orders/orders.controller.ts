import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
// TODO: khi TV4 xong Auth, thêm @UseGuards(JwtAuthGuard) ở đây
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orders.create(this.getUserId(req), dto);
  }

  private getUserId(req: any): string {
    // Payload JWT của TV4 có thể là id / userId / sub -> chỉnh cho khớp
    const fromJwt = req.user?.id ?? req.user?.userId ?? req.user?.sub;
    if (fromJwt) return fromJwt;

    // CHỈ DÙNG KHI DEV, XÓA khi Auth hoàn thành
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user-id']) {
      return String(req.headers['x-dev-user-id']);
    }
    throw new UnauthorizedException();
  }
}
