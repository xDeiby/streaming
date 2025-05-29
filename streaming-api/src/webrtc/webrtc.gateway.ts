import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WebRtcService } from './webrtc.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebrtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private readonly logger: Logger;

  constructor(private readonly webrtcService: WebRtcService) {
    this.logger = new Logger(WebrtcGateway.name);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() offer: RTCSessionDescriptionInit,
  ) {
    const answer = await this.webrtcService.handleOffer(offer);

    client.emit('answer', answer);
    this.logger.log(`Sent answer to client ${client.id}`);
  }

  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() candidate: RTCIceCandidateInit,
  ) {
    await this.webrtcService.addIceCandidate(candidate);
    this.logger.log(`Added ICE candidate from client ${client.id}`);
  }
}
