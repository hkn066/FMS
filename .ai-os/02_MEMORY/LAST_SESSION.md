# Last Session

Date: 2026-10-02

Agent: Cursor (Full-Stack Implementer)

Status: **FMS Ana Repo + FMS-BE & FMS-FE Git Submodule Mimarisi Kuruldu (INFRA-GIT-002 ✅)**

---

## Objectives

1. **Git Submodule Ayrıştırması:** Kullanıcı talebi doğrultusunda monolitik yapıdan Git Submodule mimarisine geçilmesi. `FMS` ana repo altında `FMS-BE` (Spring Boot) ve `FMS-FE` (Next.js 15) alt repoları bağımsız Git depoları olarak yapılandırıldı.
2. **Klasör Yeniden Adlandırma:** `FMS_BackEnd` -> `FMS-BE` ve `FMS_FrontEnd` -> `FMS-FE` olarak güncellendi.
3. **Otomasyon & Script Senkronizasyonu:** `run.ps1`, `run.sh`, `scripts/setup-github.ps1` ve AI-OS dokümantasyonları yeni dizin yapısına uyarlandı.
4. **Push Hazırlığı:** Kullanıcının GitHub hesabına (`hkn066`) push yapabilmesi için `scripts/push-all.ps1` tek komutluk yardımcı script hazırlandı.

---

## Technical Details

- `FMS-BE` ve `FMS-FE` dizinlerinde `git init`, initial commit ve `origin` remote tanımlamaları (`https://github.com/hkn066/FMS-BE.git` ve `https://github.com/hkn066/FMS-FE.git`) tamamlandı.
- Kök `FMS` deposunda `.gitmodules` tanımlandı ve alt modüller gitlink (`160000`) olarak bağlandı.
- Kök deponun `origin` remote adresi `https://github.com/hkn066/FMS.git` olarak atandı.

---

## Modified Files

- `.gitmodules` (Oluşturuldu)
- `run.ps1`, `run.sh`, `scripts/setup-github.ps1` (Güncellendi)
- `scripts/push-all.ps1` (Oluşturuldu)
- `.ai-os/` (Doküman ve yol senkronizasyonları tamamlandı)

- **Klasör Ağacı Buton Konumu:** Daha önce `...` butonu satırın en sağında yer alıyordu; geniş panellerde veya kısa klasör isimlerinde buton ile klasör arasında büyük boşluk kalıyor ve imleç mesafesini artırıyordu.

---

## Completed Work

### 1. Backend İyileştirmeleri (Spring Boot 3.4.5 & Spring Security)
- **`JwtAuthenticationFilter.java`:** Token ayrıştırma ve kullanıcı doğrulama işlemi `try-catch (JwtException | IllegalArgumentException e)` bloğuna alındı. Süresi dolmuş token fırlattığında exception yakalanıp `log.debug` ile loglanarak `SecurityContext` temiz bırakıldı ve filtre zinciri (`filterChain.doFilter`) kesintisiz devam ettirildi.
- **`JwtAuthenticationFilterTest.java`:** Expired token ve malformed token durumlarında exception fırlatılmadığını ve zincirin sorunsuz devam ettiğini doğrulayan 2 birim testi eklendi. `JwtServiceTest` ve `AuthServiceTest` testleri ile birlikte tüm güvenlik testleri başarıyla geçti.

### 2. Frontend İyileştirmeleri (Next.js 15 & React 19)
- **`lib/api-client.ts`:** Axios request interceptor güncellendi; `/auth/login` ve `/auth/refresh` isteklerinde `Authorization` başlığı kaldırıldı ve isteklerin temiz gönderilmesi sağlandı.
- **`app/login/page.tsx`:** Sayfa yüklendiğinde (`useEffect`) `clearAuth()` çağrılarak eski/süresi dolmuş yerel oturum kalıntılarının temizlenmesi sağlandı.
- **`components/documents/folder-tree.tsx`:**
  - `FolderItem` içindeki dropdown aksiyon butonu (`...`), klasör ikonundan (`Folder` / `FolderOpen`) hemen önceye taşındı.
  - Açılır menü `align="start"` ile panel içine doğru açılacak şekilde hizalandı.
  - Sürükle-bırak sırasında buton tıklandığında veya sürüklendiğinde istem dışı klasör taşıma tetiklenmemesi için `onDragStart={(e) => e.stopPropagation()}` uygulandı.
  - Buton boyutu `h-5 w-5` olarak ayarlanıp hiyerarşi chevron'u ve klasör ikonu ile kusursuz dikey hizalama sağlandı.

---

## Verification & Status

- **Birim Testleri:** `mvn test "-Dtest=JwtAuthenticationFilterTest,JwtServiceTest,AuthServiceTest"` başarıyla tamamlandı (4/4 test geçti).
- **Frontend Derleme:** `npm run build` ile Next.js 15 prodüksiyon derlemesi ve TypeScript denetimleri 0 hata ile tamamlandı (17/17 sayfa).
- **Servis Durumu:** `./run.ps1 restart` ve `status` ile PostgreSQL, Redis, RabbitMQ, MinIO, Backend (Port 8080) ve Frontend (Port 3000) çalışır durumda doğrulandı.
