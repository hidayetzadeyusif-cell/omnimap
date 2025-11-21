
# Elənməli:

## 1. Örtüklü Xəritə
- İnteraktiv xəritə görsənsin (Leaflet).
- Əllə bir neçə dataset yükləmək olsun (yalnız GeoJSON).
- Hər bir dataset xəritənin üzərində görsənsin.

## 2. Örtük Parametrləri
- İstifadəçi:
  - Örtükləri söndürüb yandıra (aktiv-deaktiv edə) bilməlidir.
  - Örtüklərin şəffaflığını dəyişə bilməlidir.
  - Hansı örtüklərin aktiv olduğunu görməlidir.

## 3. Örtük İnformasiya Paneli
- İstifadəçi örtük seçərkən:
  - Örtük/Dataset adını,
  - Mənbəyi,
  - İlini,
  - Kateqoriyasını
  - və Notları (məs., "Köhnə data")
  görməlidir.

## 4. Ortaq Dataset Konfiqurasiyası
- Databaza və ya backend-ə hələ ehtiyac yoxdur.
- Məsələn:

```
[
        {
        "id": "forest-coverage",
        "name": "Meşə Örtüyü",
        "source": "WRI",
        "year": 2020,
        "url": "/data/forest.geojson",
        "notes": "Good quality"
        }
]
```
- Bu fayl `/public/data/datasets.json`-da yerləşə bilər.
- Sonradan bu fayla əlavə edərək daha çox örtük/dataset yığmaq olar.

## 5. Təmiz, Başadüşülən UI
- Bu tam olaraq bizim işimiz deyil, dizayner həll edə bilər.

