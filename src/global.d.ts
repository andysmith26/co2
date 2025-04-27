declare global {
    interface Window {
      YT: {
        Player: new (element: HTMLElement, options: YT.PlayerOptions) => YT.Player;
        PlayerState: {
          PLAYING: number;
          PAUSED: number;
          ENDED: number;
          BUFFERING: number;
          CUED: number;
        };
      };
      onYouTubeIframeAPIReady: () => void;
    }
  }
  
  declare namespace YT {
    interface PlayerOptions {
      videoId: string;
      playerVars?: {
        playsinline?: number;
        rel?: number;
        modestbranding?: number;
      };
      events?: {
        onStateChange?: (event: PlayerEvent) => void;
        onReady?: (event: PlayerEvent) => void;
      };
    }
  
    interface PlayerEvent {
      data: number;
      target: Player;
    }
  
    interface Player {
      seekTo: (seconds: number, allowSeekAhead: boolean) => void;
      playVideo: () => void;
      pauseVideo: () => void;
      getCurrentTime: () => number;
      getDuration: () => number;
      destroy: () => void;
    }
  }
  
  export {};