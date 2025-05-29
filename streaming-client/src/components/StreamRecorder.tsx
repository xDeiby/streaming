import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function StreamRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  useEffect(() => {
    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (videoRef.current) videoRef.current.srcObject = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp8,opus",
        videoBitsPerSecond: 1_000_000,
      });

      const socket = io("http://localhost:3000", {});

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socket.on("video_chunk_received", (data) => {
        console.log("Video chunk received", data);
      });

      recorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          const arrayBuffer = await e.data.arrayBuffer();
          socket.emit("video_chunk", {
            user: "test",
            chunk: Array.from(new Uint8Array(arrayBuffer)), // envías como array plano
          });
        }
      };

      setMediaRecorder(recorder);
    }

    init();
  }, []);

  const startMediaRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "recording") {
      mediaRecorder.start(1000);
      console.log("Recording started");
    }
  };

  const stopMediaRecording = () => {
    mediaRecorder?.stop();
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline width={800} />
      <div>
        <button onClick={startMediaRecording}>Start recording</button>
        <button onClick={stopMediaRecording}>Stop recording</button>
      </div>
    </div>
  );
}
