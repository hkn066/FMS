# Security & Multi-Tenant Architecture

FMS güvenlik, yetkilendirme, veri izolasyonu ve tenant mimarisi ilkeleri.

---

## 1. Multi-Tenant Veri İzolasyonu

FMS, çoklu hukuk bürosu (SaaS) desteğine hazır, paylaşımlı veritabanı ve paylaşımlı şema (Discriminator Column) modelini uygular.

### Temel Bileşenler:
- **Tenant Belirteci:** Tüm tenant-aware tablolarda zorunlu `organization_id UUID NOT NULL` kolonu bulunur.
- **Varsayılan Tenant:** İlk kurulumda `DEFAULT` tenant (`00000000-0000-0000-0000-000000000001`) kullanılır.
- **`TenantContext`:** Her HTTP isteğinde JWT'den çözülen `organizationId`, `ThreadLocal` üzerinde saklanır; request bitiminde temizlenir (`clear()`).
- **Hibernate Global Filtresi (`organizationFilter`):**
  - Transaction başlangıcında `TenantFilterEnabler` devreye girer ve SQL sorgularına otomatik `organization_id = :orgId` koşulunu ekler.
  - Repository katmanında manuel tenant ID filtreleme ihtiyacını ortadan kaldırır.
- **Varlık Kayıt Güvenliği (`@PrePersist`):**
  - `BaseEntity` veya tenant-aware entity'ler persist edilmeden önce context'teki tenant ID otomatik atanır. Tenant boşsa `TenantNotFoundException` fırlatılır (HTTP 401).
- **Asenkron İş Parçacığı Güvenliği (`TenantTaskDecorator`):**
  - `@Async` metotlar veya `taskExecutor` üzerinde çalışan arka plan işlerinde `TenantContext` üst thread'den alt thread'e kopyalanır.

---

## 2. Kimlik Doğrulama (Authentication)

- **Protokol:** Stateless JWT (JSON Web Token).
- **Token Tipleri:**
  - `accessToken`: Kısa ömürlü (~15 dakika), claims: `sub` (email), `userId`, `roles`, `organizationId`.
  - `refreshToken`: Uzun ömürlü (~7 gün), veritabanında `refresh_tokens` tablosunda saklanır ve iptal edilebilir (revocation).
- **Şifreleme:** BCrypt password encoder ile şifrelenmiş parola saklama.
- **Gizli Anahtarlar:** `JWT_SECRET` ortam değişkeninden okunur; kesinlikle koda veya versiyon kontrolüne yazılmaz.

---

## 3. Rol Bazlı Yetkilendirme (RBAC)

Kullanıcılar sistemde rollerle tanımlanır ve metot seviyesinde denetlenir:

| Rol | Yetki Kapsamı |
|-----|---------------|
| `ROLE_ADMIN` | Tüm ofis yönetimi, kullanıcı CRUD, organizasyon ayarları, denetim günlüğü |
| `ROLE_PARTNER` | Yönetici avukat; tüm davaları, finansı ve raporları görme/yönetme |
| `ROLE_LAWYER` | Kendisine atanan ve ofis davalarını yürütme, duruşma, evrak yönetimi |
| `ROLE_ASSISTANT` | Evrak yükleme, duruşma takvim girişi, görev takibi |
| `ROLE_ACCOUNTING` | Masraf, tahsilat, faturalandırma ve finansal raporlama |
| `ROLE_CLIENT` | Sadece kendi dava ve duruşmalarını görüntüleme (Müvekkil Portalı) |

Metot güvenliği: Controller ve servislerde `@PreAuthorize("hasRole('ADMIN')")` veya `@PreAuthorize("hasAuthority('CASE_WRITE')")` kullanımı zorunludur.

---

## 4. Soft Delete Güvenlik İlkesi

Hukuki verilerin yanlışlıkla silinmesini ve yasal kanıt kaybını önlemek amacıyla:
- Müvekkil, Dava, Tahkim ve Doküman kayıtlarında `deleted_at TIMESTAMP` alanı kullanılır.
- Hibernate `@SQLRestriction("deleted_at IS NULL")` ile silinen kayıtlar normal sorgularda otomatik filtrelenir.
- Gerçek `DELETE` SQL sorgusu yerine `markDeleted()` metodu çağrılır.

---

## 5. Async Audit Log (Denetim İzi)

Kritik operasyonlar (`LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `DOCUMENT_DOWNLOAD`) asenkron olarak `audit_logs` tablosuna yazılır:
- İşlemi yapan `user_id` ve `organization_id`
- IP adresi ve User-Agent
- Etkilenen kaynak türü (`CLIENT`, `CASE`, `DOCUMENT`) ve ID'si
- Değişiklik özeti / payload
