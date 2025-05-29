import "./App.css";
import StreamRecorder from "./components/StreamRecorder";
import Hls from "./Hls";

function App() {
  return (
    <div>
      <Hls streamUrl="http://localhost:8080/hls/test.m3u8" />;
      <StreamRecorder />
    </div>
  );
}

export default App;
