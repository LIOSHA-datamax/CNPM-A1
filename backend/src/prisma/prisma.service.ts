import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 10;
    const retryDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Ket noi co so du lieu PostgreSQL thanh cong.');
        return;
      } catch (err: any) {
        if (attempt < maxRetries) {
          this.logger.warn(
            `Dang doi PostgreSQL khoi dong... (Thu lai ${attempt}/${maxRetries})`,
          );
          await new Promise((res) => setTimeout(res, retryDelay));
        } else {
          this.logger.error(
            'Khong the ket noi toi PostgreSQL sau nhieu lan thu. Vui long kiem tra Docker hoac PostgreSQL.',
            err?.message,
          );
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
