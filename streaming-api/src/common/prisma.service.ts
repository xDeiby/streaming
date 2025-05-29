import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService
  extends PrismaClient<PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit
{
  private logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect().then(() => {
      this.logger.log('Prisma connected');
    });

    this.$on('query', (e) => {
      this.logger.log(`Query: ${e.query}`);
      this.logger.log(`Params: ${e.params}`);
    });

    this.$on('error', (e) => {
      this.logger.error(`Error: ${e.message}`);
    });
  }
}
