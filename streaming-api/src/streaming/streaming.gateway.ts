import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { StreamingService } from './streaming.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StreamingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  private logger: Logger;

  constructor(private readonly streamingService: StreamingService) {
    this.logger = new Logger(StreamingGateway.name);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('video_chunk')
  handleVideoChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: object,
  ): void {
    console.log('Received video chunk:', data);

    this.streamingService.processVideoChunk(
      data as { user: string; chunk: number[] },
    );

    client.emit('video_chunk_received', data);
  }
}
