# API Standard

FMS REST API tasarım ve sözleşme kuralları.

Birincil kural kaynağı: `07_STANDARDS/FMS_DEVELOPMENT_RULES.md`  
Aktif uç noktalar: `04_CONTEXT/API_CONTRACT.md`

---

## 1. Tasarım İlkeleri

- **RESTful Resource Naming:** Çoğul isimler (`/api/v1/cases`, `/api/v1/hearings`).
- **Versiyonlama:** Tüm public ve internal uç noktalar `/api/v1/` önekiyle başlar.
- **İçerik Türü:** Her zaman `application/json;charset=UTF-8`.
- **Eylem Odaklı Uç Noktalar:** Standart CRUD dışı işlemler için alt kaynak (`POST /api/v1/auth/login`, `PUT /api/v1/documents/{id}/move`).

---

## 2. Standart Yanıt Zarfı (Envelope Format)

### Başarılı Yanıt (Success Response):
```json
{
  "success": true,
  "message": "İşlem başarıyla tamamlandı",
  "data": { ... },
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

### Hata Yanıtı (Error Response):
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "errors": [
    {
      "field": "title",
      "rejectedValue": "",
      "message": "Başlık alanı boş bırakılamaz"
    }
  ],
  "timestamp": "2026-09-11T14:30:00Z"
}
```

---

## 3. HTTP Durum Kodları

| Kod | Anlamı | Kullanım |
|-----|--------|----------|
| `200 OK` | Başarılı | Başarılı GET, PUT, PATCH veya veri dönen POST |
| `201 Created` | Kayıt Oluşturuldu | Başarılı POST ile yeni kaynak üretimi |
| `204 No Content` | İçerik Yok | Başarılı DELETE veya gövde dönmeyen işlem |
| `400 Bad Request` | Geçersiz İstek | Doğrulama hataları (Validation errors), eksik parametre |
| `401 Unauthorized` | Kimlik Yok/Geçersiz | Eksik veya süresi dolmuş JWT token |
| `403 Forbidden` | Yetkisiz Erişim | Kullanıcı rolünün veya tenant yetkisinin yetersiz olması |
| `404 Not Found` | Kaynak Bulunamadı | Belirtilen ID ile kayıt mevcut değil |
| `409 Conflict` | Çakışma | Tekil kısıt ihlali (Örn: aynı e-posta veya dosya numarası) |
| `500 Internal Error` | Sunucu Hatası | Beklenmeyen sistem istisnası (Global exception handler tarafından sarılır) |

---

## 4. Sayfalama ve Filtreleme

- Parametreler: `page` (0-indexed), `size` (varsayılan 20, azami 100), `sort` (alan,asc|desc).
- Arama parametresi: `q` (minimum 2 karakter).
