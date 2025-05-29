import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsPlayerProps {
  streamUrl: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ streamUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();

      // Cargar el stream HLS
      hls.loadSource(streamUrl);
      if (videoRef.current) {
        hls.attachMedia(videoRef.current);
      }

      // Manejo de errores
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error");
              break;
            case Hls.ErrorTypes.OTHER_ERROR:
              console.error("Other error");
              break;
            default:
              console.error("Fatal error", data);
          }
        }
      });

      // Cleanup on component unmount
      return () => {
        hls.destroy();
      };
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      // Para navegadores que soportan HLS nativamente (como Safari)
      if (videoRef.current) {
        videoRef.current.src = streamUrl;
      }
    }
  }, [streamUrl]);

  return <video ref={videoRef} controls autoPlay muted playsInline />;
};

export default HlsPlayer;
