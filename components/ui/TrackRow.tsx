import { SpotifyTrack } from '@/types/spotify';
import { formatDuration } from '@/utils/format';
import Image from 'next/image';

interface Props {
  track: SpotifyTrack;
  index: number;
}

export function TrackRow({ track, index }: Props) {
  return (
    <div className="flex items-center p-3 hover:bg-white/5 rounded-xl transition-colors group">
      <span className="w-8 text-center text-gray-500 font-medium mr-2">{index + 1}</span>
      {track.album?.images?.[0] ? (
        <img 
          src={track.album.images[0].url} 
          alt={track.name} 
          className="w-12 h-12 rounded shadow-md mr-4 group-hover:scale-105 transition-transform" 
        />
      ) : (
        <div className="w-12 h-12 bg-gray-800 rounded mr-4" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-white truncate">{track.name}</p>
        <p className="text-sm text-gray-400 truncate">
          {track.artists.map(a => a.name).join(', ')}
        </p>
      </div>
      <div className="text-xs text-gray-500 hidden md:block">
        {formatDuration(track.duration_ms || 0)}
      </div>
    </div>
  );
}
