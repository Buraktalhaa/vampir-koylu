import { ChevronRight, Moon } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import type { GameState } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';

/** Sonuç ekranlarının butonu: oyun bittiyse "Sonucu gör", değilse "Geceye geç". */
export function NightOrResult({ game, onPress }: { game: GameState; onPress: () => void }) {
  const { t } = useLanguage();
  return game.winner ? (
    <Button label={t.game.seeResult} phase="day" trailingIcon={ChevronRight} onPress={onPress} />
  ) : (
    <Button label={t.game.toNight} phase="day" icon={Moon} onPress={onPress} />
  );
}
