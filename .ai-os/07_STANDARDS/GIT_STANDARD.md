# Git & Version Control Standard

FMS kaynak kontrolü ve commit konvansiyonları.

---

## 1. Dal (Branch) İsimlendirme

- `feature/<kısa-açıklama>` — Yeni özellik veya modül ekleme (`feature/dms-drag-and-drop`)
- `fix/<kısa-açıklama>` — Hata düzeltme (`fix/jwt-expiration-handling`)
- `refactor/<kısa-açıklama>` — Kod sadeleştirme ve yapısal iyileştirme (`refactor/folder-service`)
- `chore/<kısa-açıklama>` — Altyapı, bağımlılık veya dokümantasyon güncellemesi (`chore/ai-os-sync`)

---

## 2. Commit Mesaj Formatı (Conventional Commits)

Format: `<type>(<scope>): <açıklama>`

### Tipler:
- `feat`: Yeni bir kullanıcı veya sistem özelliği
- `fix`: Hata çözümü
- `refactor`: İşlev değiştirmeyen kod iyileştirmesi
- `docs`: Dokümantasyon veya `.ai-os` bellek güncellemeleri
- `test`: Test ekleme veya düzeltme
- `chore`: Yapılandırma, build script'leri, bağımlılıklar

### Örnekler:
```bash
feat(dms): implement folder-in-folder drag and drop
fix(auth): handle expired refresh token with clear error message
refactor(case): decouple case-service from direct tenant lookup
docs(memory): sync current state and docker runbook
```

---

## 3. Güvenlik Kuralları

- **Kesinlikle Commit Edilmez:**
  - `.env`, `.env.local` ve gizli anahtar/parola içeren dosyalar.
  - IDE ayarları (`.idea/`, `.vscode/`).
  - Derleme çıktıları (`target/`, `.next/`, `node_modules/`, `dist/`).
- Commit işlemleri daima temiz bir çalışma dizini ve doğrulanmış linter/build ile yapılır.
