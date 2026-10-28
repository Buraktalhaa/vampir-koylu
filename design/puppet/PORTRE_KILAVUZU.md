# Vampir Köylü · Portre Kılavuzu (Gölge Kukla, v1)

Yeni bir karakteri mevcut 15 portreyle aynı dilde çizmek için kurallar. Kaynak kodu `scripts/art/portraits.py`'dedir. Yeni karakter oraya bir `add(...)` bloğu olarak eklenir, SVG'ler betikle üretilir.

## 1. Fikir

Her karakter, kandil ışığıyla arkadan aydınlatılmış **oyulmuş deri bir kukladır** (Karagöz perdesi).

- Gövde düz siyah bir siluettir. Ayrıntı içeride çizilmez, **delik açılarak** verilir: delikten arkadaki perde görünür.
- Karakteri tanıtan şey **profil hattı + başlık + elindeki nesnedir**. Yüz ifadesi yalnızca göz deliği ve profil çıkıntılarıyla (bıyık, diş, maske) verilir.
- Renk yalnızca **şeffaf deri kakmada** bulunur ve bu kakma **takım rengidir** (`#TEAM`). Başka renk kullanılmaz; yalnızca nötr metal (perçin `#C9A26B`, demir `#8C7A64`) ve alev/parıltı (`#FFF1C8`) serbesttir.

## 2. Kadraj (büyük: viewBox 0 0 240 320)

| Öğe | Değer |
|---|---|
| Yön | Profil, **sağa bakar** (Kâhin bakışı oyuncuya doğru akar) |
| Baş | Ense x≈88, alın x≈164, burun ucu 178,104, tepe y≈44, çene y≈150 |
| Boyun | x 100–144, y 150–190 |
| Gövde | Omuz çizgisi y 186; alt kenar y 320'ye taşar (büst kesimi) |
| Başlık bölgesi | y 12–80; viewBox dışına çıkmaz (clipPath yok) |
| Kol | Omuz pivotu **174,208**; dirsek ~198,282; el **216,224**; çubuk elden sağ alta (232,320) iner |
| Nesne | El çevresinde, x ≤ 236; büyük nesne en fazla r≈38 |
| Arka plan | **Yok**. Şeffaftır; perde (kandil/gece) kodda ayrıca çizilir. |

Ortak gövde parçaları (`HEAD`, `TORSO`, `CAPE`, `HOOD`, `ARM`) mümkün olduğunca **değiştirilmeden** kullanılır. Ölçek ve ışık tutarlılığı buradan gelir. Bir karakteri farklı kılmak için baş hattında yalnızca burun, çene ve ağız bölgesi değiştirilir (bkz. Büyücü, Yalnız Vampir).

## 3. Delik (perforasyon) kuralları

1. Delik, içinde bulunduğu siluetle **aynı `<path>` içinde** bir alt yol olarak çizilir ve `fill-rule="evenodd"` kullanılır. `mask` kullanılmaz.
2. Deliğin **altında başka siyah katman olmamalıdır**; yoksa siyah görünür. Örnek: miğfer başın üstüne bindiği için miğfere delik açılmaz, pirinç perçin konur.
3. Her portrede bir **etek bandı** bulunur: y≈300'de baklava, nokta, yıldız veya yarık tekrarı. Karakterin motifi buradan seçilir (`band_holes(kind=…)`).
4. Göğüs/etekte 2–5 adet **karakter motifi** olur: hilal (Vampir), yıldız (Kâhin, Büyücü), yaprak (Şifacı), harlequin baklava (Deli).
5. En küçük delik r=2.2 (büyükte). Küçük sürümde göz dışındaki delikler kaldırılır.

## 4. Kakma (takım rengi)

- `fill="#TEAM"` olmalıdır; kod bunu gerçek renkle değiştirir. Rol Çalan veya dönüşen karakterlerde renk böylece değiştirilebilir.
- Her portrede **1–2 kakma** olur. Kakmalardan biri **küçük sürümde de görünmelidir** (şapka bandı, küre, maske…).
- Kakmanın üstünde ince siyah ayrım çizgileri (dikiş, şişe sıvı hattı) serbesttir.
- Gizli bağlamlarda (devir, gece listeleri, oylama avatarları) `#TEAM` → **`#5A4A3C` (nötr deri)** ile değiştirilir. Böylece takım ele verilmez.

## 5. Hareketli gruplar

| id | İçerik | Pivot |
|---|---|---|
| `head` | Baş ve yüz çıkıntıları | 122,188 (boyun) |
| `hat` | Başlık / şapka / boynuz | Her dosyada yorum olarak yazılıdır |
| `arm` | Kol, el nesnesi, çubuk, perçinler | 174,208 (omuz) |
| `flame` | Fener alevi (Gece Misafiri) | 216,272 (alev dibi) |
| `bat` | Omuzdaki yarasa (Yalnız Vampir) | 66,158 |
| `drum` | Şaman davulu | 196,262 |

Pivot, grubun ilk satırında `<!-- pivot: x,y -->` yorumu olarak bulunur. Yeni bir hareketli parça eklenecekse `group("id", içerik, (x, y), "not")` kullanılır.

## 6. Küçük sürüm (viewBox 0 0 64 64)

- Büyük koordinatlardan **x 34–226, y 10–202** penceresi 1/3 ölçekle alınır (`matrix(.3333 0 0 .3333 -11.333 -3.333)`).
- Gövde yerine yalnızca omuz şeridi (`SHOULDERS_S`) kullanılır. Göz büyütülür (`EYE_S`). Ayrıntı delikleri kaldırılır.
- El nesnesi büyükteki yerinde kalırsa kesilir. Bu yüzden nesne pencere içine, sağ alta **ayrıca ve kalınlaştırılarak** (çizgi ≥ 8) yerleştirilir.
- Çerçeve ve arka plan **yoktur**; kod yuvarlak perde ve takım halkasını çizer.
- 40 px'te test edilir: siluetin tek başına tanınması gerekir.

## 7. Yeni karakter kontrol listesi

- [ ] Profil sağa bakıyor, ortak HEAD/TORSO/ARM kullanılıyor
- [ ] Tanıtıcı başlık **veya** nesne var; 40 px'te ayırt ediliyor
- [ ] Etek bandı + 2–5 motif deliği; delikler başka siyah katmanın üstünde değil
- [ ] 1–2 `#TEAM` kakma, biri küçükte görünüyor
- [ ] Hareketli parçalar `id`'li grup ve pivot yorumu taşıyor
- [ ] Yalnız path/circle/ellipse/rect/polygon/g/gradient; filter, mask, text, style, class yok
- [ ] Hem kandil hem gece perdesinde denendi
- [ ] Dosya < 15 KB, ad İngilizce kimlik (`newRole.svg`, `newRole-small.svg`)
