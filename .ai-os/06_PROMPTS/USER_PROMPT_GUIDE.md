# Kullanıcı Prompt & Görev Kılavuzu (User Prompt Guide)

Bu doküman, geliştiricinin Cursor ve diğer AI asistanlarına görev tanımlarken kullanacağı standart prompt şablonlarını ve gerçek kullanım örneklerini içerir.

---

## 1. Standart Görev Formatı (Şablon)

Yeni bir işlem veya görev başlatırken aşağıdaki şablonu kopyalayıp ilgili alanları doldurarak prompt olarak iletebilirsiniz:

```text
[GÖREV]
Modül: [Örn: Tahkim / Finans / Doküman / Auth / Duruşma / Dava]
İşlem Türü: [Yeni Özellik / Hata Çözümü / Refactor / UI İyileştirme]

[İSTER DETAYLARI]
1. ... (Kullanıcı olarak ne görmek/yapmak istiyorsunuz?)
2. ... (Varsa iş kuralı / validasyon: Örn: "Dolu klasör silinmesin, uyarı versin")
3. ... (Ekran veya API beklentisi: Örn: "Tabloya 'Kaza Tarihi' kolonu eklensin")

[BEKLENTİ & KAPSAM]
- Rol: Full-Stack Implementer (Gerekiyorsa hem backend hem frontend uçtan uca)
- İlk adımda bana kısa uygulama planını sun ve onayımı al, ardından uygula.
- İşlem bitince AI-OS hafıza protokolünü çalıştır (LAST_SESSION, CURRENT_STATE, TASKS/DONE).
```

---

## 2. Gerçek Kullanım Örnekleri

### Örnek A: Uçtan Uca (Full-Stack) Yeni Özellik

```text
[GÖREV]
Modül: Tahkim (Arbitration)
İşlem Türü: Yeni Özellik

[İSTER DETAYLARI]
1. Tahkim detay sayfasına (/arbitration/[id]) "İtiraz Hakem Heyeti" sekmesi eklemek istiyorum.
2. Bu sekmede itiraz tarihi, itiraz gerekçesi ve karar sonucu alanları tutulmalı.
3. Backend'de arbitration modülü altında gerekli entity/DTO/servis katmanlarını oluştur (gerekirse Flyway migration yaz).
4. Frontend'de formu React Hook Form + Zod ile bağla ve enterprise minimal tasarım sistemine uy.

[BEKLENTİ]
- Planı çıkartıp benden onay al, ardından kodlamaya geç.
- Kodlama bitince AI-OS hafıza dosyalarını güncelle.
```

### Örnek B: Sadece UI / UX İyileştirmesi

```text
[GÖREV]
Modül: Doküman Yönetimi (DMS)
İşlem Türü: UI İyileştirme

[İSTER DETAYLARI]
1. /documents sayfasındaki klasör ağacında klasörlerin yanında kaç adet belge olduğunu gösteren küçük bir rozet (badge) görmek istiyorum.
2. Tasarımda text-slate-500 ve font-medium kullanılsın, aşırı dikkat dağıtıcı olmasın.
3. Backend'e yeni sorgu atmak yerine mevcut tree endpoint'inden bu sayı dönüyor mu kontrol et, dönmüyorsa en hafif şekilde entegre et.

[BEKLENTİ]
- Dosyaları değiştirmeden önce planını söyle, onaylayayım.
```

### Örnek C: Hata Bildirimi (Bug Fix)

```text
[GÖREV]
Modül: Dava Yönetimi (/cases)
İşlem Türü: Hata Çözümü

[İSTER DETAYLARI]
1. Yeni dava oluştururken müvekkil seçimi dropdown'ında arama yaptığımda liste donuyor / istek 401 dönüyor.
2. Konsoldaki hata: "TenantNotFoundException".
3. TenantContext'in bu istekte neden set edilmediğini veya kaybolduğunu araştırıp düzelt.

[BEKLENTİ]
- Kök nedeni açıkla, düzeltmeyi yap ve hafızayı güncelle.
```

---

## 3. Oturumu Kapatırken / Kaydederken Kullanılacak Prompt

Geliştirme seansını bitirmek veya durumu sabitlemek için aşağıdaki tek satırlık prompt yeterlidir:

```text
Bu oturumu tamamlıyoruz. AI-OS hafıza protokolünü uygula: LAST_SESSION.md, CURRENT_STATE.md, CHANGELOG.md ve TASKS.md dosyalarını senkronize et.
```
