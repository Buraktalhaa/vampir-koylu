# Vampir Köylü

Tek telefonda, elden ele oynanan bir sosyal çıkarım oyunu (Wolvesville / Werewolf benzeri). Expo + React Native + Expo Router.

## Çalıştırma

```bash
npm install
npx expo start
```

Telefonda **Expo Go** ile QR kodu okut (telefon ve bilgisayar aynı Wi-Fi'da olmalı; olmuyorsa `npx expo start --tunnel`).
Değişiklikler görünmüyorsa önbelleği temizle: `npx expo start --clear`.

## Testler

Oyun kurallarının (karakterler, oylama, kazanma, kurulum, çeviriler) doğru çalıştığını kontrol eden birim testleri.

```bash
npm test             # tüm testleri bir kez çalıştırır
npm run test:watch   # dosya değiştikçe testleri tekrar çalıştırır
```

Tek bir dosyayı ya da tek bir testi çalıştırmak için:

```bash
npx jest __tests__/roles-test.ts      # sadece bu dosya
npx jest -t "Şifacı"                   # adında "Şifacı" geçen testler
```

| Dosya | Ne kontrol eder |
|---|---|
| `__tests__/roles-test.ts` | Her karakterin yetenekleri (Vampir, Şifacı, Büyücü, İntikamcı, Köylü) |
| `__tests__/flow-test.ts` | İlk gece ayarı, gündüz oylaması, kazanma koşulları, ölenin rolünün açıklanması |
| `__tests__/events-test.ts` | Oyun sonu özetindeki olay kaydı |
| `__tests__/setup-test.ts` | Rol dağılımı (rastgele / sabit / karışık) ve kurulum hataları |
| `__tests__/i18n-test.ts` | Her dilde tüm karakter ve yetenek metinlerinin eksiksiz olması |

Ortak test yardımcısı `test-utils/game.ts` içinde: rolleri sırayla dağıtarak (rastgelelik olmadan) oyun kurar.

Yeni bir karakter ekledikten sonra `npm test` çalıştır: eski kurallar bozulduysa ya da yeni karakterin çevirisi eksikse testler hata verir.

## Kontroller

```bash
npx tsc --noEmit   # tip kontrolü
npx expo lint      # lint
```

## Yeni karakter eklemek

1. `src/game/roles/<id>.ts` dosyasında `defineRole` ile tanımla.
2. `src/game/roles/index.ts` içindeki listeye ekle.
3. `src/i18n/locales/tr.ts` ve `en.ts` içine isim, açıklama, detaylı açıklama (`tip`) ve yetenek metinlerini yaz.
4. `src/theme/roles.ts` içine ikonunu ekle.
5. Yeni mekanik gerekiyorsa `src/game/engine/effects.ts` içine tek bir efekt ekle.
6. Kurallarını test etmek için `__tests__/roles-test.ts` içine testlerini yaz.

## Klasörler

| Klasör | İçerik |
|---|---|
| `src/app/` | Ekranlar (Expo Router). `game.tsx` yalnızca oyun akışını yönetir |
| `src/game/` | Oyun motoru: roller, kurallar, kurulum, olaylar (arayüzden bağımsız, testli) |
| `src/components/ui/` | Genel yapı taşları: `AppText`, `Button`, `Screen`, `ScreenHeader`, `TextField`, `Chip`, `Stepper`, `SettingSwitch`, `ErrorBox`, `InfoBand`, `ActionBar`, `CountdownRing` |
| `src/components/game/` | Oyun ekranları: `Handoff`, `NightTurn`, `IdleTurn`, `SpellChoice`, `TargetPicker`, `MorningReport`, `Discussion`, `SecretVote`, `OpenVote`, `Verdict`, `Revenge`, `GameOver` ve ortak parçaları |
| `src/components/player/` | Oyuncu avatarı ve oyuncu ızgarası |
| `src/components/role/` | Karakter kartı, madalyon, rol rozeti, takım etiketi |
| `src/components/art/` | Ana menü görseli ve rastgele gece manzaraları (SVG) |
| `src/components/icons/` | Lucide'da olmayan özel ikonlar (ör. yarasa) |
| `src/i18n/` | Dil desteği: `types.ts` (metin yapısı), `locales/tr.ts`, `locales/en.ts` |
| `src/store/` | Kurulum taslağı ve devam eden oyunun kaydı |
| `src/theme/` | Tasarım token'ları, takım ve rol görselleri |
| `src/hooks/` | Ortak hook'lar (ör. geri sayım) |

## Bağımlılık politikası

Dışarıdan yalnızca yaygın ve köklü kütüphaneler kullanılır; küçük şeyler projede yazılır.

| Paket | Neden |
|---|---|
| `expo-*`, `react-native-*` | Expo'nun kendi modülleri ve Expo Router'ın zorunlu bağımlılıkları |
| `react-native-svg` | SVG çizimler (madalyonlar, sahneler, geri sayım halkası) |
| `@react-native-async-storage/async-storage` | Oyuncu listesi, ayarlar ve devam eden oyunun kaydı |
| `@expo-google-fonts/*` | Cinzel, Fira Sans, Pirata One fontları |
| `lucide-react-native` | İkon seti |
| `jest`, `jest-expo` (geliştirme) | Testler |

Yeni paket eklemeden önce: bu iş birkaç satırla yazılabiliyorsa yazılır. Paket gerekiyorsa `npx expo install <paket>` ile eklenir.
