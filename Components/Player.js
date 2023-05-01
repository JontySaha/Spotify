import { SpeakerWaveIcon as MaxVolume } from "@heroicons/react/24/solid";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import {
  BackwardIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ForwardIcon,
  ArrowUturnLeftIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/solid";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "@/atoms/songAtom";
import useSongInfo from "@/hooks/useSongInfo";
import useSpotify from "@/hooks/useSpotify";

const track = {
  name: "",
  album: {
      images: [
          { url: "" }
      ]
  },
  artists: [
      { name: "" }
  ]
}

function Player() {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [is_active, setActive] = useState(false);
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(0.1);
  const [player, setPlayer] = useState(undefined);
 

  const songInfo = useSongInfo(currentTrackId);
  const [current_track, setTrack] = useState(track);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);
    console.log({current_track});

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = spotifyApi.getAccessToken();
      const player = new window.Spotify.Player({
        name: "Spotify Web",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.6,
      });

      // console.log(spotifyApi.getAccessToken());

      setPlayer(player);
      // debounce((volume) => {
      //   player.setVolume(volume).catch((err) => {});
      // }, 300)

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });
      // player.setVolume(1.0).then(() => {
      //   console.log('Volume updated!');
      // });
      // player.addListener('player_state_changed', ({
      //   position,
      //   duration,
      //   track_window: { next_tracks }
      // }) => {
      //   console.log('next playing', next_tracks);
      //   console.log('Position in Song', position);
      //   console.log('Duration of Song', duration);
      // });
      

      player.addListener('player_state_changed', ( state => {

        if (!state) {
            return;
        }
        

        setTrack(state.track_window.current_track);
        // setPaused(state.paused);
        console.log(state);

        player.getCurrentState().then( state => { 
            (!state)? setActive(false) : setActive(true) 
        });

    }));

      

      player.connect().then((success) => {
        if (success) {
          console.log(
            "The Web Playback SDK successfully connected to Spotify!"
          );
        }
      });
    };
  }, [spotifyApi]);

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackId(data.body?.item?.id);
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  };

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((data) => {
      if (data.body?.is_playing) {
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSong();
      //  setVolume(50);
    }
  }, [currentTrackId, spotifyApi, session]);

  // console.log(player.setVolume(0.7));

  // const debouncedAdjustVolume = useCallback(
  //   debounce((volume) => {
  //     spotifyApi.setVolume(volume).catch((err) => {});
  //   }, 300),
  //   []
  // );

  // useEffect(() => {
  //   if (volume > 0 && volume < 1.0) {
  //     debouncedAdjustVolume(volume);
  //   }
  // }, [volume]);
  // console.log(songInfo?.album.images?.[0].url);

  if(!is_active){
    return (
      <>
          
      </>)
} else {
    return (
      <div className="h-24 bg-gradient-to-b from-gray-900 to-black text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8">
        <div className="flex items-center space-x-4">
          <img
            className="hidden md:inline h-12 w-12"
            src={current_track.album.images[0].url}
            alt=""
          />
          <div>
            <h3>{current_track.name}</h3>
            <p className="text-sm text-gray-500">
              {current_track.artists[0].name}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-evenly">
          <ArrowsRightLeftIcon className="button" />
          
          <BackwardIcon className="button" onClick={() => { player.previousTrack() }} />
          {isPlaying ? (
            <PauseCircleIcon onClick={handlePlayPause} className="h-10 w-10" />
          ) : (
            <PlayCircleIcon onClick={handlePlayPause} className="h-10 w-10" />
          )}
          <ForwardIcon className="button" onClick={() => { player.nextTrack() }}/>
          <ArrowUturnLeftIcon
            className="button"
            
          />
   
        </div>
        {/* <div className="flex items-center space-x-4 md:space-x-4 justify-end pr-5">
          <SpeakerWaveIcon
            className="button"
            onClick={() => player.setVolume(player.getVolume() - 0.1)}
          />
          <input
            className="w-14 md:w-28"
            // value={volume}
            // onChange={(e) => setVolume(Number(e.target.value))}
            type="range"
            min={0.0}
            max={1.0}
            step={0.1}
          />
          <MaxVolume
            className="button"
            // onClick={() => volume < 1.0 && player.setVolume(volume + 0.1)}
          />
        </div> */}
      </div>
    );
  }
}

export default Player;
