'use client';

import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import WavesurferPlayer from '@wavesurfer/react';
import { CirclePauseIcon, CirclePlayIcon } from 'lucide-react';

type Props = {
  source: string;
  isPlaying: boolean;
  color: 'primary' | 'secondary';
  onPlayPause: () => void;
  onEnded: () => void;
};

const AudioPlayer: React.FC<Props> = ({
  source,
  isPlaying,
  color,
  onPlayPause,
  onEnded,
}: Props) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const onPlayerReady = (ws: WaveSurfer) => {
    wavesurferRef.current = ws;
    ws.on('finish', () => {
      onEnded();
      ws.seekTo(0);
    });
  };

  useEffect(() => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.play();
      } else {
        wavesurferRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex justify-start items-center gap-[9px]">
      {isPlaying ? (
        <CirclePauseIcon
          onClick={onPlayPause}
          className={`w-7 h-7 cursor-pointer ${color === 'primary' ? 'text-primary' : 'text-white'}`}
        />
      ) : (
        <CirclePlayIcon
          onClick={onPlayPause}
          className={`w-7 h-7 cursor-pointer ${color === 'primary' ? 'text-primary' : 'text-white'}`}
        />
      )}
      <WavesurferPlayer
        height={30}
        width={98}
        waveColor={color === 'primary' ? '#005451' : '#ffffff'}
        progressColor="#70BAB5"
        cursorColor="transparent"
        barWidth={3}
        barRadius={6}
        barGap={2}
        hideScrollbar={true}
        autoCenter={true}
        fillParent={true}
        url={source}
        onReady={onPlayerReady}
      />
    </div>
  );
};

export default AudioPlayer;
