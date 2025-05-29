import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { StreamingModule } from './streaming/streaming.module';
import { WebrtcModule } from './webrtc/webrtc.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UsersModule,
    MessagesModule,
    StreamingModule,
    WebrtcModule,
  ],
})
export class AppModule {}
