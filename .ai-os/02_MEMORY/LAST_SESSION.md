# Last Session

Date: 2026-10-20

Agent: Cursor (Full-Stack Implementer)

Status: **Dava Klasör Taşıma ve Dava İçeren Klasör Silme Koruması Tamamlandı (TASK-DMS-012 ✅)**

---

## Objectives

1. Klasör bağı kopmuş veya taşınmak istenen davaların kullanıcı tarafından arayüzden seçilerek istenen bir klasörün (`Genel Davalar` kökü veya `abcd` gibi alt klasörler) altına taşınabilmesini sağlamak.
2. Klasörün altında dava dosyası varken klasörlerin silinebilmesi açığını hem backend API hem de frontend UI seviyesinde kesin olarak engellemek.

---

## Technical Details

- **Backend Taşıma:** `CaseController` & `CaseService` katmanına `PUT /api/v1/cases/{id}/move-folder` endpoint'i eklendi. `CaseDmsFolderService.moveCaseFolder` ile kök klasörü olmayan veya önceden silinmiş davalar için kök ve 5 standart alt klasör yeniden provision edilir ve hedef klasör altına bağlanır.
- **Backend Silme Koruması:** `FolderService.deleteFolder` metodunda doğrudan davanın kök klasörü (`caseRepository.countCasesByDmsRootFolderId`) ve hiyerarşik olarak alt klasörlerinde dava/tahkim barındıran durumlar (`countCasesByDmsRootFolderIdIn`) kontrol edilerek silme işlemi `BusinessException` ile engellendi.
- **Frontend Taşıma Dialogu:** `MoveCaseDialog` modalı ve `CasesTable` satır menüsüne "Klasöre Taşı" seçeneği eklendi; `useMoveCaseFolder` mutasyonu ile entegre edildi.
- **Frontend Silme Koruması:** `folder-tree-utils.ts` içindeki `folderHasContent` ve `folderHasCases` fonksiyonları dava varlığını kontrol edecek şekilde güncellendi; `DmsExplorer` silme uyarı modalı ve buton engellemesi uygulandı.

---

## Modified Files

- `FMS-BE/src/main/java/com/lawoffice/fms/casemanagement/presentation/CaseController.java`
- `FMS-BE/src/main/java/com/lawoffice/fms/casemanagement/application/CaseService.java`
- `FMS-BE/src/main/java/com/lawoffice/fms/casemanagement/application/CaseDmsFolderService.java`
- `FMS-BE/src/main/java/com/lawoffice/fms/casemanagement/application/dto/MoveCaseFolderRequest.java`
- `FMS-BE/src/main/java/com/lawoffice/fms/casemanagement/infrastructure/CaseRepository.java`
- `FMS-BE/src/main/java/com/lawoffice/fms/arbitration/infrastructure/ArbitrationCaseRepository.java`
- `FMS-BE/src/main/java/com/lawoffice/fms/document/application/FolderService.java`
- `FMS-BE/src/test/java/com/lawoffice/fms/document/application/FolderServiceTest.java`
- `FMS-FE/src/services/case.service.ts`
- `FMS-FE/src/hooks/use-api.ts`
- `FMS-FE/src/lib/folder-tree-utils.ts`
- `FMS-FE/src/components/case/move-case-dialog.tsx`
- `FMS-FE/src/components/case/cases-table.tsx`
- `FMS-FE/src/components/documents/folder-tree.tsx`
- `FMS-FE/src/components/documents/dms-explorer.tsx`
- `FMS-FE/src/app/cases/page.tsx`
- `.ai-os/02_MEMORY/CURRENT_STATE.md`
- `.ai-os/02_MEMORY/CHANGELOG.md`
- `.ai-os/02_MEMORY/LAST_SESSION.md`
- `.ai-os/03_PLANNING/DONE.md`
- `.ai-os/03_PLANNING/TASKS.md`
- `.ai-os/03_PLANNING/NEXT_TASK.md`

---

## Verification & Status

- Backend derleme ve testleri (`mvn test-compile`, `mvn test`): 29 test başarıyla geçti (BUILD SUCCESS).
- Frontend derleme ve type check (`npm run build`): Sıfır hata ile derlendi (Compiled successfully, production static & dynamic rotaları oluşturuldu).
- Runtime doğrulaması: `.\run.ps1 restart` ile PostgreSQL, Redis, RabbitMQ, MinIO, Backend (Port 8080) ve Frontend (Port 3000) başarıyla ayağa kaldırıldı.
- `GET http://localhost:8080/actuator/health` sonucu: `{"status":"UP"}`.
- Dava taşıma hedef listesinde `abcd` gibi genel alt klasörlerin hiyerarşik seçimi sağlandı.
