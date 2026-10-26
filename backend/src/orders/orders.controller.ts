import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Task 9: GET /orders/me
   * Lấy lịch sử đơn hàng của người dùng hiện tại
   */
  @Get('me')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đơn hàng của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng được sắp xếp mới nhất' })
  async getMyOrders(
    @Query('userId') userIdQuery?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const effectiveUserId = userIdHeader || userIdQuery;
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
}
