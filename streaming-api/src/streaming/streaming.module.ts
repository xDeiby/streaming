import { Module } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { StreamingGateway } from './streaming.gateway';

@Module({
  providers: [StreamingGateway, StreamingService],
})
export class StreamingModule {}
