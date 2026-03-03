# Genel Erişilebilirlik Anayasası (WCAG 2.2 AA)

Bu belge, TÜM platformlar (Web, Mobil, Masaüstü) için geçerli olan, tartışmaya kapalı temel erişilebilirlik standartlarını belirler.

## 1. Algılanabilirlik (Perceivable)
*Bilgi ve kullanıcı arayüzü bileşenleri, kullanıcıların algılayabileceği şekilde sunulmalıdır.*

- **Metin Alternatifleri (1.1)**: Metin olmayan tüm içeriklerin (resimler, ikonlar, grafikler) eşdeğer amacı taşıyan bir metin alternatifi olmalıdır.
- **Zaman Tabanlı Medya (1.2)**: Tüm ses/video içerikleri için altyazı ve döküm zorunludur.
- **Uyarlanabilirlik (1.3)**: Bilgi ve yapı (başlıklar, listeler) programatik olarak belirlenebilmelidir. İçerik, ekran yönünü (Dikey/Yatay) kısıtlamamalıdır.
- **Ayırt Edilebilirlik (1.4)**:
    - **Renk**: Bilgi, ASLA sadece renk kullanılarak iletilmemelidir.
    - **Kontrast**: 18pt'den küçük metinler **4.5:1** kontrast gerektirir. Grafikler/UI **3:1** gerektirir.
    - **Yeniden Boyutlandırma**: Metinler, içerik veya işlev kaybı olmadan **%200**'e kadar büyütülebilmelidir.

## 2. İşletilebilirlik (Operable)
*Kullanıcı arayüzü bileşenleri ve gezinme kullanılabilir olmalıdır.*

- **Klavye Erişilebilirliği (2.1)**: Tüm işlevler, bireysel tuş vuruşları için belirli zamanlamalar gerektirmeden klavye arayüzü ile kullanılabilir olmalıdır. Klavye tuzağı olmamalıdır.
- **Yeterli Zaman (2.2)**: Kullanıcılar zaman sınırlarını kapatabilmeli, ayarlayabilmeli veya uzatabilmelidir. Animasyonlar durdurulabilir olmalıdır.
- **Nöbetler (2.3)**: Hiçbir içerik saniyede 3 kereden fazla yanıp sönmemelidir.
- **Gezinilebilirlik (2.4)**:
    - **Odak Sırası**: Sıralı ve anlamlı olmalıdır.
    - **Odak Görünürlüğü**: Klavye odak göstergesi net bir şekilde görünür olmalıdır.
    - **Hedef Boyutu**: Minimum **24x24 px** (WCAG 2.2 yeni), İdeal **44x44 px/pt** (Mobil).

## 3. Anlaşılabilirlik (Understandable)
*Bilgi ve kullanıcı arayüzünün çalışması anlaşılır olmalıdır.*

- **Okunabilirlik (3.1)**: Sayfanın ve içerik parçalarının dili programatik olarak belirlenebilmelidir.
- **Tahmin Edilebilirlik (3.2)**: Bileşenler tahmin edilebilir şekilde görünmeli ve çalışmalıdır (Tutarlılık). Odak değişimi otomatik olarak bağlam değişikliğine neden olmamalıdır.
- **Giriş Yardımı (3.3)**:
    - **Hata Tanımlama**: Hatalar metin olarak tanımlanmalı ve kullanıcıya açıklanmalıdır.
    - **Etiketler**: Kullanıcı girişi gerektiren durumlar için etiketler veya talimatlar sağlanmalıdır.

## 4. Sağlamlık (Robust)
*İçerik, yardımcı teknolojiler de dahil olmak üzere çok çeşitli kullanıcı aracıları tarafından güvenilir bir şekilde yorumlanabilecek kadar sağlam olmalıdır.*

- **Uyumluluk (4.1)**:
    - **Ayrıştırma**: Başlangıç ve bitiş etiketleri tam olmalı, öğeler spesifikasyonlara göre iç içe yerleştirilmeli, ID'ler benzersiz olmalıdır.
    - **İsim, Rol, Değer**: Tüm UI bileşenleri için isim ve rol programatik olarak belirlenebilmeli; durumlar, özellikler ve değerler kullanıcı aracıları tarafından ayarlanabilmelidir.
