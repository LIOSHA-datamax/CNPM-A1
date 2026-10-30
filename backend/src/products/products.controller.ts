import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (menu)' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm thành công' })
  findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @Get('toppings')
  @ApiOperation({ summary: 'Lấy danh sách toppings' })
  findAllToppings() {
    return this.productsService.findAllToppings();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một sản phẩm' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
