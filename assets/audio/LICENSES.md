# Ses ve müzik lisansları

Bu klasördeki seslerin çoğu **projenin kendisi tarafından kodla sentezlenmiştir** (telif projeye ait, kısıt yok).
Gündüz sesi ayrıca **CC0** (kamu malı) lisanslı gerçek kayıtlar içerir; CC0 ticari kullanım dahil serbesttir,
isim vermek zorunlu değildir — yine de kaynaklar aşağıda yazılıdır.

Yeniden üretmek için: `python3 scripts/synth-audio.py <çıktı-klasörü>` → WAV dosyaları,
ardından macOS'ta `afconvert -f m4af -d aac -b 64000 -s 0 <ad>.wav <ad>.m4a`.

| Dosya | Kullanım | Kaynak | Lisans |
|---|---|---|---|
| `menu.m4a` | Giriş / ana menü: uğuldayan rüzgâr, uyumsuz uğultu, uzak piyano ve kalp atışı (32 sn döngü) | `scripts/synth-audio.py` | Proje (telifsiz) |
| `night.m4a` | Gece ambiyansı: uğuldayan rüzgâr, uyumsuz drone, uzak çan (30 sn döngü) | `scripts/synth-audio.py` | Proje (telifsiz) |
| `day.m4a` | Gündüz: gerçek kalabalık tartışması + bağırış + cam kırılması (40 sn döngü) | Kayıtlar: [kyles — Cuban men shouting arguing](https://freesound.org/people/kyles/sounds/362088/), [craigsmith — Group of People with Man Yelling](https://freesound.org/people/craigsmith/sounds/480726/) (Freesound). Cam kırılması ve uğultu: `scripts/synth-audio.py`. Karışım: `scripts/build-day-audio.py` | **CC0** (kayıtlar) + Proje |
| `vote.m4a` | Oylama başlarken çalan efekt | `scripts/synth-audio.py` | Proje (telifsiz) |

## Dışarıdan ses eklerken

Bir dosyayı başka bir kaynaktan değiştirirsen bu tabloya **kaynak bağlantısını, yazarı ve lisansı** yaz.
Güvenli lisanslar: CC0 (Kenney.nl, OpenGameArt CC0, Freesound CC0), Pixabay lisansı.
CC-BY ise yazarın adı uygulama içinde (ör. Ayarlar > Hakkında) belirtilmelidir.
