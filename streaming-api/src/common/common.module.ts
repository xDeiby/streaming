import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import FfmepgService from './ffmepg.service';

@Global()
@Module({
  providers: [PrismaService, FfmepgService],
  exports: [PrismaService, FfmepgService],
})
export class CommonModule {}
