import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {});

export default function WebRTCStreaming() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      await peerConnection.current?.setRemoteDescription(answer);
      console.log("Received answer from server");
    });

    socket.on("ice_candidate", async (candidate: RTCIceCandidateInit) => {
      try {
        await peerConnection.current?.addIceCandidate(candidate);
        console.log("Received ICE candidate from server");
      } catch (error) {
        console.error("Error adding received ICE candidate", error);
      }
    });
  }, []);

  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (videoRef.current) videoRef.current.srcObject = stream;

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          candidate: event.candidate,
        });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", offer);

    setIsStreaming(true);
  };

  const stopStreaming = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsStreaming(false);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline width={400} />

      <button onClick={startStreaming}>Start Streaming</button>
      <button onClick={stopStreaming}>Stop Streaming</button>
    </div>
  );
}
