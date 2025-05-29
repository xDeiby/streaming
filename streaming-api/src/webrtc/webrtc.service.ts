import { Injectable, Logger } from '@nestjs/common';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'wrtc';

@Injectable()
export class WebRtcService {
  private peerConnection: RTCPeerConnection;
  private logger = new Logger(WebRtcService.name);

  constructor() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.logger.debug(
          `Backend ICE candidate: ${JSON.stringify(event.candidate)}`,
        );
        // Aquí tú deberías emitir esto al frontend vía Socket.IO
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.logger.log(`Recibido track: kind=${event.track.kind}`);
      // Aquí podrías enviar el stream a ffmpeg
    };
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    this.logger.log('📨 Recibida oferta del cliente');

    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return this.peerConnection.localDescription;
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  getPeerConnection() {
    return this.peerConnection;
  }
}
