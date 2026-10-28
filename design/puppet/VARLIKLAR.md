# Vampir Köylü · Varlık paketi 2 (B · Gölge Kukla)

Tüm SVG'ler portrelerle aynı kurallara uyar:

- Yalnızca path, circle, ellipse, rect, polygon, g, linearGradient ve radialGradient kullanılır. filter, mask, text, image, style ve class yoktur.
- Kökte sabit width/height yoktur.
- Gradyan id'leri her dosyada dosya adıyla öneklidir (ör. `night-3-sky-g`). Aynı ekranda birden çok SVG kullanılsa da çakışmaz.

## backdrops/ (viewBox 0 0 390 844)

| Dosya | Perde | Sahne |
|---|---|---|
| menu.svg | kandil | Köy, kilise, tepede şato; önde köylü ve vampir kuklaları karşı karşıya |
| night-1.svg | gece | Köy, sokak feneri, çit |
| night-2.svg | gece | Şato, çıplak ağaçlar, yarasalar (`bats` grubu) |
| night-3.svg | gece | Mezarlık, kilise, sis (`mist` grubu) |
| night-4.svg | gece | Çam ormanı, dalda baykuş, sis |
| night-5.svg | gece | Değirmen (`blades` grubu, pivot yorumda), buğday |
| night-6.svg | gece | Kuyu, kova, kedi, arkada köy |
| day-1.svg | kandil | Meydan, saat kulesi, çeşme, kalabalık |
| day-2.svg | kandil | Darağacı (`rope` grubu), dirgen ve meşaleli kalabalık |
| day-3.svg | kandil | Pazar yeri, tenteler, sandık ve fıçı |

Katman yapısı: `sky` (rect) → `far` → `mid` → `near` → (`bats` / `mist` / `rope`) → `vignette` → `shade`.

- **Paralaks:** `far` ×0.2, `mid` ×0.5, `near` ×1.0. Katmanlar x −48…438 aralığına taşar, yani her yöne 48 birim kaydırma payı vardır.
- **Alt %40:** `shade` gradyanı y 422'den başlar, y 506'da %90 koyudur. Yazı ve butonlar bu bölgeye gelir.
- **Gece → gündüz geçişi:** İki ayrı dosya üst üste konur (ör. night-1 ve day-1), üstteki opaklık 1→0 yapılır (1800 ms, `cubic-bezier(.4,0,.2,1)`). İsterseniz yalnız `sky` rect'leri arasında geçiş yapıp siluetleri sabit tutabilirsiniz.

## moments/ (viewBox 0 0 320 240)

| Dosya | Hareketli gruplar | #TEAM |
|---|---|---|
| death.svg | `figure` (yatık kukla), `rod`, `smoke` | Kuklanın kakması: rol açıklanıyorsa takım rengi, açıklanmıyorsa `team.hidden` |
| no-death.svg | `rooster` | — |
| lynch.svg | `rope`, `crowd` | — |
| tie.svg | `scale` (terazi) | — |
| win-village.svg | `flag`, `p1`…`p3` | Bayrak ve kuklalar: `team.village` |
| win-vampire.svg | `bats`, `p1`, `p2` | Kanlı ay ve kuklalar: `team.vampire` |
| win-neutral.svg | `p1` (Deli) | `team.neutral` |

Pivotlar ve süreler her grubun ilk satırında yorum olarak yazılıdır. Kukla gruplarının (`p1`, `figure`) içinde portrelerdeki `head`/`arm`/`hat` grupları önekli olarak durur (ör. `p1-arm`); portre animasyonları burada da çalışır.

## emblems/ (64×64)

Gövde rengi `#F3E2C4` (`text.primary`), kakma `#TEAM`. Koyu zemin üzerinde kullanılır. Açık zeminde gövde rengini kodda değiştirin.

## avatars/ (64×64)

- 10 nötr kukla başı, sağa bakar ve takım bilgisi taşımaz.
- Arka planı kod çizer; gündüz kandil, gece indigo perde.
- Sağ alt köşedeki ~22×22 alan baş harf rozeti için boş bırakıldı.
- Kararlı seçim için şu yöntem önerilir: `index = (djb2(name.toLocaleLowerCase('tr')) % 10) + 1` → `avatar-01` … `avatar-10`.
- Aynı oyunda iki oyuncuya aynı avatar düşerse, ikinci oyuncu bir sonraki boş avatara kaydırılır.

## brand/

| Dosya | Not |
|---|---|
| logo-silhouette.svg | Aynı logo, tek renk #0B0705: kandil perdesinde (ana menü) kullanılır |
| logo.svg | Cinzel Black harfleri path'e çevrildi (OFL lisanslı yazı tipinin dönüştürülmesine izin verilir). `bat`, `shadow`, `word`, `divider` grupları var. |
| icon-1024.png | Köşesiz, tam kare |
| adaptive-foreground.png | Saydam; figür ortadaki %66 güvenli alanın içinde |
| adaptive-background.png | Kandil perdesi |
| splash.png | 1284×2778, zemin #0B0705, ortada logo (900 px genişlik) |

## components.md

Bileşen tablosu: butonlar, kart, çip, sayaç, anahtar, alt sayfa, geri sayım halkası, oyuncu hücresi, bilgi bandı.

## screens/

13 PNG (@3x, 1170×2532). Her ekranın ölçüleri ve token'ları `screens/NOTES.md` dosyasında. Kaynakları tasarım tuvalinde düzenlenebilir artboard olarak duruyor.

01 ana menü · 02 karakter kurulumu · 03 telefonu devret · 04 gece hedef seçimi · 05 sabah raporu · 06 tartışma · 07 oyun sonu · 08 ansiklopedi · 09 karakter detayı · 10 açık oylama · 11 karar (asıldı) · 11b karar (beraberlik) · 12 gece bekleme
