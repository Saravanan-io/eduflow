import ReactPlayer from 'react-player';
import { PlayCircle, PauseCircle, Maximize2, SkipForward } from 'lucide-react';

const VideoPlayer = ({ url, onEnded }) => {
  return (
    <div className="player-wrapper glass" style={{
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      background: '#000',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    }}>
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
      
      {!url && (
        <div className="flex flex-col items-center justify-center h-100" style={{ height: '100%', gap: '1rem' }}>
          <PlayCircle size={64} color="var(--primary)" />
          <p style={{ color: 'var(--text-muted)' }}>No video selected</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
