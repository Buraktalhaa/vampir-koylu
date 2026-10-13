import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Müzik ve ses efektleri. Uygulama boyunca tek örnek; React'ten bağımsız çalışır.
 * Sesler kodla üretildi (scripts/synth-audio.py), telifsiz — bkz. assets/audio/LICENSES.md.
 */
const MUSIC = {
  menu: require('@assets/audio/menu.m4a'),
  night: require('@assets/audio/night.m4a'),
  day: require('@assets/audio/day.m4a'),
} as const;

const SOUNDS = {
  vote: require('@assets/audio/vote.m4a'),
} as const;

export type MusicTrack = keyof typeof MUSIC;
export type SoundName = keyof typeof SOUNDS;

const MUSIC_VOLUME = 0.45;
const SOUND_VOLUME = 0.9;

const music: Partial<Record<MusicTrack, AudioPlayer>> = {};
const sounds: Partial<Record<SoundName, AudioPlayer>> = {};
/** Açılışta giriş müziği; ayarlar yüklenip müzik açılınca başlar. */
let current: MusicTrack | null = 'menu';
let musicEnabled = false;
let soundsEnabled = true;
let ready: Promise<void> | null = null;

/** Ses modu bir kez ayarlanır; çalma her zaman bu ayar bittikten sonra başlar. */
function audioReady(): Promise<void> {
  // Telefon sessiz modda olsa da çalar (sesi Ayarlar'dan kapatılabilir); başka uygulamanın müziğini kesmez.
  ready ??= setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
  return ready;
}

function musicPlayer(track: MusicTrack): AudioPlayer {
  let player = music[track];
  if (!player) {
    player = createAudioPlayer(MUSIC[track]);
    player.loop = true;
    player.volume = MUSIC_VOLUME;
    music[track] = player;
  }
  return player;
}

function sync() {
  audioReady().then(() => {
    for (const track of Object.keys(MUSIC) as MusicTrack[]) {
      const shouldPlay = musicEnabled && track === current;
      if (shouldPlay) musicPlayer(track).play();
      else music[track]?.pause();
    }
  });
}

/** Arka plan müziğini değiştirir (null = sessiz). Aynı parça zaten çalıyorsa kaldığı yerden devam eder. */
export function setMusicTrack(track: MusicTrack | null) {
  if (track === current) return;
  current = track;
  sync();
}

export function setMusicEnabled(enabled: boolean) {
  musicEnabled = enabled;
  sync();
}

export function setSoundsEnabled(enabled: boolean) {
  soundsEnabled = enabled;
}

/** Kısa ses efekti çalar (ör. oylama başladı). */
export function playSound(name: SoundName) {
  if (!soundsEnabled) return;
  let player = sounds[name];
  if (!player) {
    player = createAudioPlayer(SOUNDS[name]);
    player.volume = SOUND_VOLUME;
    sounds[name] = player;
  }
  const p = player;
  audioReady()
    .then(() => p.seekTo(0))
    .then(() => p.play())
    .catch(() => {});
}
