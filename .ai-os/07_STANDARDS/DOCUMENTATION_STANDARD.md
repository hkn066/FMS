# Documentation Standard

AI-OS ve proje içi dokümantasyon ilkeleri.

---

## 1. Temel Prensipler

- **Tek Kaynak İlkesi (Single Source of Truth):** Her bilgi türü yalnızca kendi yetkili dosyasında tutulur.
  - Mimari kararlar → `01_KNOWLEDGE/ARCHITECTURE_DECISIONS.md`
  - Canlı durum → `02_MEMORY/CURRENT_STATE.md`
  - Son oturum → `02_MEMORY/LAST_SESSION.md`
  - Aktif işler → `03_PLANNING/TASKS.md`
  - Tamamlananlar → `03_PLANNING/DONE.md`
  - Teknik sözleşmeler → `04_CONTEXT/`
- **Living Documentation:** Dokümanlar statik değildir; her kod veya mimari değişikliğinde ilgili dosya aynı oturumda güncellenir.
- **Dış Dosya Yasağı:** `.ai-os/` hiyerarşisi dışında rasgele `.md` veya `.txt` dosyaları oluşturulmaz.

---

## 2. Dil ve Format

- **Kod İçi & Sözleşmeler:** İngilizce (sınıf, değişken, API modelleri, commit mesajları).
- **Kullanıcı İletişimi & Raporlama:** Türkçe.
- **Biçimlendirme:**
  - Paragraf yığınları yerine net Markdown tabloları ve maddeli listeler tercih edilir.
  - Kod bloklarında dil belirteci (`ts`, `java`, `bash`, `json`) kullanılmalıdır.
  - Tamamlanan veya geçersiz hale gelen taslak notlar geride bırakılmaz.
