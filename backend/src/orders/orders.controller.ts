import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Task 6: POST /orders
   * Tạo đơn hàng mới từ giỏ hàng
   */
  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới (Task 6)' })
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(this.getUserId(req), dto);
  }

  /**
   * Task 9: GET /orders/me
   * Lấy lịch sử đơn hàng của người dùng hiện tại
   */
  @Get('me')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đơn hàng của người dùng hiện tại (Task 9)' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng được sắp xếp mới nhất' })
  async getMyOrders(
    @Req() req: any,
    @Query('userId') userIdQuery?: string,
    @Headers('x-user-id') userIdHeader?: string,
    @Headers('x-dev-user-id') devUserIdHeader?: string,
  ) {
    const fromJwt = req.user?.id ?? req.user?.userId ?? req.user?.sub;
    const effectiveUserId = fromJwt || userIdHeader || devUserIdHeader || userIdQuery;
    return this.ordersService.getMyOrders(effectiveUserId);
  }

  /**
   * Xem chi tiết đơn hàng theo ID hoặc Order Number (#BL-...)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một đơn hàng theo ID hoặc Mã đơn' })
  @ApiResponse({ status: 200, description: 'Chi tiết đơn hàng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  private getUserId(req: any): string {
    const fromJwt = req.user?.id ?? req.user?.userId ?? req.user?.sub;
    if (fromJwt) return fromJwt;

    if (req.headers['x-user-id']) {
      return String(req.headers['x-user-id']);
    }

    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user-id']) {
      return String(req.headers['x-dev-user-id']);
    }
    throw new UnauthorizedException('Vui lòng đăng nhập để đặt đơn');
  }
}
