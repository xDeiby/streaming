import { Injectable } from '@nestjs/common';
import FfmpegService from 'src/common/ffmepg.service';

@Injectable()
export class StreamingService {
  constructor(private readonly ffmpegService: FfmpegService) {}

  // Add methods to handle streaming logic here
  // For example, you might have methods to process video chunks, manage streams, etc.
  processVideoChunk(data: { user: string; chunk: number[] }): void {
    this.ffmpegService.initializeStream(data.user);
    this.ffmpegService.processVideoChunk(data.user, data.chunk);
  }
}
