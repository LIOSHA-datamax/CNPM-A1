import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Task 2: GET /products
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (menu) và danh sách topping' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm thành công' })
  async findAll() {
    return this.productsService.findAll();
  }

  /**
   * GET /products/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một sản phẩm' })
  @ApiResponse({ status: 200, description: 'Chi tiết sản phẩm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
