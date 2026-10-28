# Vampir Köylü · Tasarım Değerleri (B · Gölge Kukla)

Aynı değerler `tokens.json` dosyasında da bulunur.

## Renk

| Token | Hex | Kullanım |
|---|---|---|
| `bg.base` | `#0B0705` | En koyu zemin, siluet rengi |
| `bg.day` | `#160D09` | Gündüz/menü zemini |
| `bg.night` | `#0E0A1C` | Gece ekranları zemini |
| `surface.day` | `#1A100B` | Gündüz kart/panel |
| `surface.night` | `#161230` | Gece kart/panel |
| `border.wood` | `#3A2214` | Gündüz kart kenarı (ahşap perde çerçevesi) |
| `border.night` | `#2E2650` | Gece kart kenarı |
| `lamp.core` | `#F8CF8C` | Kandil merkezi, birincil buton üst rengi |
| `lamp.mid` | `#E08A3C` | Kandil ortası, birincil buton alt rengi |
| `lamp.edge` | `#6A2D10` | Kandil kenarı (is) |
| `night.core` | `#4A3A78` | Gece perdesi merkezi |
| `night.mid` | `#2A2050` | Gece perdesi ortası |
| `text.primary` | `#F3E2C4` | Ana metin (zeminlerde ≥ 12:1) |
| `text.secondary` | `#C2A688` | İkincil metin (gündüz zeminde ≥ 7:1) |
| `text.night2` | `#A9A3C9` | Gece ikincil metin (≥ 7:1) |
| `text.onLamp` | `#1A0D07` | Kandil renkli buton üstü metin |
| `team.village` | `#E6C34A` | Köy |
| `team.vampire` | `#C8392B` | Vampirler |
| `team.neutral` | `#36A57C` | Tarafsız |
| `team.hidden` | `#5A4A3C` | Gizli bağlamda `#TEAM` yerine |
| `metal.brass` | `#C9A26B` | Perçin, düğme |
| `metal.iron` | `#8C7A64` | Zincir |
| `glow` | `#FFF1C8` | Alev, parıltı |
| `danger` | `#E0644F` | Hata metni (takım renginden ayrı, daha açık) |

**Takım rengi kuralı:** `team.*` yalnızca rol açılışı ve rol bilgisi ekranlarında kullanılır. Devir ekranında, gece ekranlarında ve oylamada portreler `team.hidden` ile çizilir.

## Perde (arka ışık)

| Durum | Gradyan (radyal, merkez %50 / %40) |
|---|---|
| Gündüz / menü / rol açılışı | `#F8CF8C 0%` → `#E08A3C 42%` → `#6A2D10 78%` → `#1A0D07 100%` |
| Gece (devir, seçim, bekleme) | `#4A3A78 0%` → `#2A2050 45%` → `#0E0A1C 100%` |

## Yazı

| Rol | Yazı tipi | Boyut / satır | Ağırlık | Harf aralığı |
|---|---|---|---|---|
| Ekran başlığı (Display) | Cinzel | 40 / 44 | 700 | 0 |
| Rol adı | Cinzel | 36 / 40 | 700 | 0 |
| Bölüm başlığı | Cinzel | 22 / 28 | 700 | 0.02em |
| Gövde | Karla | 16 / 23 | 400 | 0 |
| Gövde küçük | Karla | 14 / 20 | 400 | 0 |
| Etiket (BÜYÜK HARF) | Karla | 12 / 16 | 700 | 0.16em |
| Buton | Karla | 15 / 20 | 700 | 0.12em |
| Sayaç (geri sayım) | Cinzel | 56 / 56 | 900 | 0, tabular |

Her iki yazı tipi de Türkçe karakterleri (ç ğ ı İ ö ş ü â) destekler. Büyük harf dönüşümünde Türkçe yerel ayarı kullanılmalıdır (`toLocaleUpperCase('tr')`); aksi halde "i" harfi "I" olur.

## Boşluk ve şekil

| Token | Değer |
|---|---|
| `space` | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 |
| Ekran kenar boşluğu | 20 |
| Kart iç boşluğu | 16 (küçük kart) / 20 (rol kartı) |
| Izgara aralığı | 12 |
| `radius.card` | 16 |
| `radius.button` | 28 (hap) |
| `radius.chip` | 14 |
| Birincil buton yüksekliği | 56 |
| En küçük dokunma alanı | 48 × 48 |
| Portre (rol kartı) | 210 × 280 (240×320 oranı) |
| Küçük portre (kart/liste) | 40 · 48 · 56 |
| Küçük portre halkası | 2 px, `team.*` veya `team.hidden` |

## Gölge ve ışık (react-native)

| Ad | Değer |
|---|---|
| Kart gölgesi | shadowColor `#000`, opacity 0.55, radius 14, offset 0,12 (Android elevation 10) |
| Kandil ışıltısı (birincil buton) | shadowColor `#E08A3C`, opacity 0.35, radius 14, offset 0,0 |
| Kart üst ışık | Kart üstünde %0–60 arası `rgba(224,138,60,.22)` → saydam lineer gradyan (gece: `rgba(74,58,120,.25)`) |

## Hareket: portre (sürekli, rol açılışında)

| Grup | Ne yapar | Değer | Süre (ms) | Eğri | Tekrar |
|---|---|---|---|---|---|
| `arm` | Omuzdan sallanır | rotate −3° ↔ +4° | 2400 | `cubic-bezier(.37,0,.63,1)` | sonsuz, gidip gelir |
| `head` | Hafif baş eğme | rotate −1.5° ↔ +1° | 4000 | `cubic-bezier(.37,0,.63,1)` | sonsuz, gidip gelir, 600 ms gecikme |
| `hat` | Şapka sallanır | rotate −2° ↔ +2° | 3200 | `cubic-bezier(.37,0,.63,1)` | sonsuz, gidip gelir, 400 ms gecikme |
| `hat` (Başkan) | Selam | rotate 0 → −8° → 0 | 900 | `cubic-bezier(.34,1.56,.64,1)` | rol açılışında bir kez |
| `flame` | Alev titrer | scaleY .88 ↔ 1.08, rotate ±5° | 520 | `cubic-bezier(.45,0,.55,1)` | sonsuz, ±80 ms rastgele |
| `bat` | Kanat çırpar | scaleY 1 → .55 → 1 | 300 × 3 | ease-in-out | her 4000 ms'de bir |
| `drum` | Vuruşta titrer | scale 1 → 1.04 → 1 | 180 | `cubic-bezier(0,0,.2,1)` | `arm` +4°'ye ulaşınca |
| Perde | Kandil titremesi | gradyan opaklığı .92 ↔ 1 | 1400 | linear, rastgele | gündüz ekranlarında sürekli |

## Hareket: ana anlar (ilk değerler, ekranlar turunda kesinleşecek)

| An | Ne hareket eder | Süre (ms) | Eğri |
|---|---|---|---|
| Rol açılışı · kart çevirme | Kart rotateY 0→90° (arka yüz) | 220 | `cubic-bezier(.4,0,1,1)` |
| | Yüz değişir, rotateY 90→0° | 320 | `cubic-bezier(0,0,.2,1)` |
| | Portre translateY 24→0, opaklık 0→1 | 420 (+120 gecikme) | `cubic-bezier(.2,.8,.2,1)` |
| | `#TEAM` kakması `team.hidden` → takım rengine geçer | 600 (+300 gecikme) | ease-out |
| Gece → gündüz (**ana an**) | Perde indigo → kandil gradyanı (renk geçişi) | 1800 | `cubic-bezier(.4,0,.2,1)` |
| | Vinyet daralır, merkez parlaklığı .6 → 1 | 1800 | aynı |
| | Siluetler (köy sahnesi) translateY 8→0 | 900 (+600 gecikme) | `cubic-bezier(.2,.8,.2,1)` |
| Gündüz → gece | Kandil söner: kandil → indigo | 1200 | `cubic-bezier(.4,0,1,1)` |
| Sabah ölüm duyurusu | Kukla çubuktan düşer: rotate 0→12°, translateY 0→40, opaklık 1→0 | 700 | `cubic-bezier(.55,0,1,.45)` |
| | Perde %40 kararır, sonra geri gelir | 400 + 800 | ease-in / ease-out |
| Oyun sonu | Kazanan siluetler aşağıdan yükselir: translateY 30→0 | 500, 80 ms aralıkla | `cubic-bezier(.2,.8,.2,1)` |
| Buton basma | scale 1 → .97 | 90 / 160 | ease-out |

Hareket azaltma ayarı açıksa: sürekli döngüler kapatılır, geçişler 200 ms'lik opaklık geçişine iner.
