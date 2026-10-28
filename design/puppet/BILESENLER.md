# Vampir Köylü · Bileşenler (B · Gölge Kukla)

Token adları `tokens.json` dosyasındakilerle aynıdır. Ölçüler dp/pt cinsindendir. "Gündüz" ve "gece" sütunları, ekranın perde moduna göre değişen değerlerdir. Mod ekrana göre seçilir:

- **Gündüz:** menü, kurulum, sabah, tartışma, oylama, oyun sonu, rol açılışı
- **Gece:** devir, gece seçimi, bekleme

Ortak kurallar:

- **Basılı durum:** `scale .97`, 90 ms içeri / 160 ms dışarı (ease-out). Ayrıca dolgu %8 koyulaşır: üstüne `rgba(11,7,5,.08)` katmanı.
- **Devre dışı:** opaklık .38, gölge yok, dokunma kapalı. Metin rengi değişmez.
- **Odak (erişilebilirlik):** 2 dp `lamp.core` dış halka, 2 dp boşlukla.
- **En küçük dokunma alanı:** 48 × 48. Görsel daha küçükse `hitSlop` ile genişletilir.

## Butonlar

| Bileşen | Yükseklik | Dolgu | Metin | Kenar | Yarıçap | Gölge | Basılı | Devre dışı |
|---|---|---|---|---|---|---|---|---|
| Birincil | 56 | Dikey gradyan `lamp.core` → `lamp.mid` | `text.onLamp`, Buton (Karla 15/700/.12em, BÜYÜK HARF) | 2 `bg.base` | 28 | Kandil ışıltısı: `lamp.mid`, op .35, r 14 | scale .97, ışıltı op .2 | op .38, ışıltı yok |
| Birincil · gece | 56 | Düz `#E9E0F5` | `bg.night` | 2 `bg.base` | 28 | `night.core` op .5, r 14 | aynı | aynı |
| İkincil | 52 | Saydam | `text.primary` | 1.5 `lamp.mid` (gece: `night.core` → `#7D6CB8`) | 26 | yok | dolgu `rgba(224,138,60,.12)` | op .38 |
| Üçüncül (metin) | 44 | yok | `text.secondary`, Karla 15/700 | yok | — | yok | metin `text.primary` | op .38 |
| Tehlike | 52 | `#8E2A1F` | `text.primary` | 1.5 `danger` | 26 | yok | dolgu `#A6342A` | op .38 |
| İkon butonu (⚙️, ⓘ) | 44 (görsel 24) | Saydam | ikon `text.secondary` | yok | 22 | yok | dolgu `rgba(243,226,196,.10)` | op .38 |

Tehlike butonu ("Yeniden başlat", "Çık", "Erken bitir") her zaman bir onay alt sayfası açar.

## Kart

| Bileşen | Dolgu | Kenar | Yarıçap | Gölge | Seçili | Notlar |
|---|---|---|---|---|---|---|
| Kart · gündüz | `surface.day` + üstten `rgba(224,138,60,.22)` → 0 (ilk %60) | 2 `border.wood`, iç 1 `rgba(248,207,140,.16)` | 16 | Kart gölgesi (siyah, op .55, r 14, y 12) | kenar 2 `lamp.mid` | İç boşluk 16 (küçük) / 20 (rol kartı) |
| Kart · gece | `surface.night` + üstten `rgba(74,58,120,.25)` → 0 | 2 `border.night` | 16 | aynı | kenar 2 `#A9A3C9` | Takım rengi **asla** kullanılmaz |
| Rol kartı (açılış) | Kart · gündüz | 2 `border.wood` | 20 | aynı + `lamp.mid` op .12 r 40 | — | Portre 210×280, kandil perdesi önünde |
| Ölüm kartı | `surface.day`, üst bölümde `moments/death.svg` | 2 `border.wood` | 16 | aynı | — | Rol açıklanmıyorsa `#TEAM` → `team.hidden` |

## Çip

| Durum | Yükseklik | Dolgu | Metin | Kenar | Yarıçap |
|---|---|---|---|---|---|
| Normal | 36 | Saydam | `text.primary`, Karla 14/500 | 1.5 `border.wood` (gece `border.night`) | 18 |
| Seçili | 36 | `lamp.core` op .16 | `lamp.core`, Karla 14/700 | 1.5 `lamp.core` | 18 |
| Takım etiketi | 28 | Saydam | `team.*`, Etiket (12/700/.16em) | 1.5 `team.*` | 14 |
| Devre dışı | 36 | Saydam | op .38 | aynı | 18 |

Hazır seçim çipleri ("Klasik Mod", "Hepsi Rastgele") Seçili durumda solunda 16 dp onay ikonu taşır.

## Sayaç (− 2 +)

| Parça | Değer |
|---|---|
| Kap | 36 yükseklik, 108 genişlik, yarıçap 18, kenar 1.5 `border.wood`, dolgu `bg.base` |
| − / + | 36 × 36 dokunma (hitSlop ile 48), ikon 16 `text.primary`; basılı `rgba(243,226,196,.12)` |
| Sayı | Cinzel 18/700 `text.primary`, ortada, tabular |
| Sınırda | İlgili ikon op .38 (ör. 0'da −) |
| Rastgele aralık kutusu ("1–3") | Aynı kap; metin Karla 15/700 `lamp.core`; sağda 12 dp aşağı ok; dokununca alt sayfa (en az / en çok sayaçları) |
| Yok / Rastgele geçişi | 2 segmentli; kap 32 yükseklik, yarıçap 16, dolgu `bg.base`; seçili segment dolgu `border.wood`, metin `text.primary`; diğeri `text.secondary` |

## Anahtar (switch)

| Durum | Ray | Topuz | Not |
|---|---|---|---|
| Kapalı | 52 × 32, yarıçap 16, dolgu `#2A1A12`, kenar 1.5 `border.wood` | 24, `text.secondary`, solda | |
| Açık | dolgu `lamp.mid`, kenar yok | 24, `lamp.core`, sağda, ışıltı `lamp.mid` op .4 r 8 | Geçiş 180 ms `cubic-bezier(.2,.8,.2,1)` |
| Devre dışı | op .38 | | |

Satır: 64 yükseklik, solda etiket (Karla 16) ve altında açıklama (Karla 13 `text.secondary`), sağda anahtar.

## Alt sayfa (bottom sheet)

| Parça | Değer |
|---|---|
| Arka perde | `rgba(11,7,5,.72)`; dokununca kapanır |
| Sayfa | dolgu `surface.day` (gece `surface.night`), üst köşe yarıçapı 24, üst kenar 2 `border.wood` |
| Tutamak | 40 × 4, yarıçap 2, `text.secondary` op .5, üstten 10 |
| İç boşluk | 20 yan, 24 alt (+ güvenli alan) |
| Başlık | Bölüm başlığı (Cinzel 22/700) |
| Ana buton | Birincil, en altta |
| Açılış | translateY %100 → 0, 320 ms `cubic-bezier(.2,.8,.2,1)`; perde opaklığı 0 → 1, 200 ms |
| Kapanış | 220 ms `cubic-bezier(.4,0,1,1)` |

## Geri sayım halkası

| Parça | Değer |
|---|---|
| Boyut | 220 çap, çizgi 10 |
| Ray | `border.wood` |
| İlerleme | `lamp.mid` → `lamp.core` (açısal); uç yuvarlak; saat yönünde azalır |
| Merkez | Sayaç (Cinzel 56/900, `text.primary`, tabular) + altında Etiket "KALAN SÜRE" |
| Son 30 sn | ilerleme `danger`; sayı her saniye scale 1 → 1.06 → 1 (240 ms) |
| Süre bitti | Halka 3 kez nabız (op 1 ↔ .4, 300 ms), titreşim |
| Animasyon | sürekli, linear |

## Oyuncu hücresi (3 sütunlu ızgara)

| Durum | Avatar | Halka | Ad | Diğer |
|---|---|---|---|---|
| Normal | 64, `avatars/*` nötr perde üstünde | 2 `border.wood` (gece `border.night`) | Karla 14/500 `text.primary`, tek satır, ortada | Hücre 104 × 108, yarıçap 16, dokunma tüm hücre |
| Seçili | aynı + scale 1.04 | 3 `lamp.core` (gece `#E9E0F5`) + ışıltı r 10 | Karla 14/700 `lamp.core` (gece `#E9E0F5`) | Sağ üstte 20 dp onay rozeti; ikinci hedefte "2" rozeti |
| Ölü | gri: siluet op .35 | 2 kesikli `text.secondary` op .5 | üstü çizili, `text.secondary` | Sağ alt köşede küçük mezar taşı ikonu; seçilemez |
| Devre dışı (kendisi / kural) | op .38 | aynı | op .38 | Dokunma kapalı; uzun basınca nedeni gösteren ipucu |
| Sürüklenen (kurulum) | scale 1.08, gölge r 18 | 2 `lamp.mid` | aynı | Diğer hücreler 180 ms'de yer değiştirir |

Avatarın baş harfi: sağ altta 22 dp daire, dolgu `bg.base`, kenar 1.5 `border.wood`, harf Karla 12/700 `text.primary`.

## Bilgi bandı

| Tür | Dolgu | Sol işaret | Metin | Kenar | Yarıçap |
|---|---|---|---|---|---|
| Bilgi | `rgba(169,163,201,.12)` | ⓘ 20 `text.night2` | `text.primary` Karla 14 | 1 `rgba(169,163,201,.35)` | 12 |
| Uyarı | `rgba(224,138,60,.14)` | ! 20 `lamp.core` | `text.primary` | 1 `rgba(224,138,60,.45)` | 12 |
| Hata | `rgba(224,100,79,.14)` | × 20 `danger` | `#F3C9C0` | 1 `rgba(224,100,79,.5)` | 12 |

Bant iç boşluğu 12 × 14, ikon-metin aralığı 10, en fazla 3 satır. Kurulum ekranındaki "yer sayacı" hatası hata bandını kullanır; sayaç metni (7/9) `danger` rengine döner.
