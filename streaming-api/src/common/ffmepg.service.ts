import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

@Injectable()
export default class FfmpegService {
  private streamProcesses = new Map();
  private streamInputs = new Map();

  initializeStream(streamKey: string) {
    // Si ya existe un stream para esta clave, termínalo
    // if (this.streamProcesses.has(streamKey)) {
    //   await this.stopStream(streamKey);
    // }

    // Crear un stream legible para pasar los chunks a FFmpeg
    const inputStream = new Readable({
      read() {}, // Implementación requerida pero vacía ya que empujaremos datos manualmente
    });

    // Configurar FFmpeg con fluent-ffmpeg
    const rtmpUrl = `rtmp://localhost:1935/live/${streamKey}`;

    const command = ffmpeg(inputStream)
      .inputFormat('webm')
      // Especificar opciones para la entrada webm con VP8/VP9 y Opus
      .inputOptions([
        '-analyzeduration',
        '0',
        '-probesize',
        '32',
        '-fflags',
        '+nobuffer+fastseek',
      ])
      .outputFormat('flv')
      .videoCodec('libx264')
      .videoFilters('format=yuv420p') // Asegurar formato compatible con Flash/RTMP
      .audioCodec('aac')
      .audioBitrate('128k')
      .audioChannels(2)
      .outputOptions([
        '-preset',
        'ultrafast',
        '-tune',
        'zerolatency',
        '-g',
        '30', // Keyframe cada 30 frames
        '-bufsize',
        '1000k',
        '-pkt_size',
        '1316',
        '-flush_packets',
        '0',
      ])
      .on('start', (commandLine) => {
        console.log(`FFmpeg started with command: ${commandLine}`);
      })
      .on('stderr', (stderrLine) => {
        // Log detallado para diagnóstico si es necesario
        console.log('FFmpeg stderr:', stderrLine);
      })
      .on('error', (err, stdout, stderr) => {
        console.error(`FFmpeg error: ${err.message}`);
        // Guardar error completo en un log para diagnóstico
        console.error(`FFmpeg stderr: ${stderr}`);
        // this.cleanupStream(streamKey);
      })
      .on('end', () => {
        console.log('FFmpeg process ended normally');
        // this.cleanupStream(streamKey);
      });

    // Iniciar la transmisión a RTMP
    command.output(rtmpUrl).run();

    // Guardar referencias para su uso posterior
    this.streamProcesses.set(streamKey, command);
    this.streamInputs.set(streamKey, inputStream);

    console.log(`Stream initialized for key: ${streamKey}`);
    return { success: true, message: 'Stream initialized' };
  }

  processVideoChunk(streamKey: string, chunkArray: number[]) {
    const inputStream = this.streamInputs.get(streamKey) as Readable;

    if (!inputStream) {
      return { success: false, message: 'No active stream' };
    }

    // Convertir el array de números a Buffer
    const chunk = Buffer.from(chunkArray);

    // Enviar a FFmpeg
    inputStream.push(chunk);

    return { success: true, message: 'Chunk processed' };
  }

  // async stopStream(streamKey: string) {
  //   const inputStream = this.streamInputs.get(streamKey) as Readable;
  //   const command = this.streamProcesses.get(streamKey) as ffmpeg.FfmpegCommand;

  //   // Indicar EOF al stream de entrada
  //   if (inputStream) {
  //     inputStream.push(null);
  //     this.streamInputs.delete(streamKey);
  //   }

  //   // Esperar a que FFmpeg termine
  //   if (command) {
  //     await new Promise<void>((resolve) => {
  //       command.on('end', resolve);
  //       command.on('error', resolve);

  //       // Forzar terminación después de 2 segundos si no cierra correctamente
  //       setTimeout(() => {
  //         try {
  //           command.kill('SIGKILL');
  //         } catch (e) {
  //           // Ignorar errores al forzar terminación
  //         }
  //         resolve();
  //       }, 2000);
  //     });

  //     this.streamProcesses.delete(streamKey);
  //   }

  //   return { success: true, message: 'Stream stopped' };
  // }
}
