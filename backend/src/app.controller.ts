import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái máy chủ (Task 1: Hello World)' })
  @ApiResponse({ status: 200, description: 'Hệ thống hoạt động bình thường' })
  getHello() {
    return this.appService.getHello();
  }
}
