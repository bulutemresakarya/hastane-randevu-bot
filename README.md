# 🏥 WhatsApp Randevu Otomasyon Botu

![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)
![WhatsApp-Web.js](https://img.shields.io/badge/Library-whatsapp--web.js-25D366.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Bu proje, WhatsApp üzerinden hizmet veren hastane randevu sistemleri ile otomatik etkileşime girerek, kullanıcı tarafından belirlenen kriterlere (bölüm, tarih vb.) uygun randevuları yakalamak için geliştirilmiş bir **Node.js** otomasyon botudur.

Popüler `whatsapp-web.js` kütüphanesini kullanarak gerçek bir WhatsApp istemcisi gibi davranır ve randevu süreçlerini (menü seçimi, kimlik doğrulama, bölüm seçimi) otomatikleştirir.

---

## 🚀 Özellikler

- **Tam Otomasyon:** Menü navigasyonu, TC Kimlik/Doğum Tarihi girişi ve onay süreçlerini otomatik yönetir.
- **Akıllı Tarih Kontrolü:** Sadece hedeflenen tarihteki randevuları onaylar, aksi takdirde işlemi iptal edip döngüye devam eder.
- **Spesifik Bölüm Seçimi:** Aynı isimde birden fazla poliklinik varsa (Örn: Endokrin 1, Endokrin 2), regex ile spesifik alt bölümü seçebilir.
- **Periyodik Kontrol:** Belirlenen aralıklarla (varsayılan: 15 dk veya 1 saat) sistemi sorgular.
- **Güvenlik:** Hassas veriler (TC, Telefon No) kod içinde değil, `.env` dosyasında saklanır.
- **Modüler Yapı:** Mesaj şablonları ve yardımcı fonksiyonlar ayrı modüllerde tutularak temiz kod (Clean Code) prensiplerine uyulmuştur.

## 🛠️ Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/bulutemresakarya/whatsapp-randevu-bot.git
cd whatsapp-randevu-bot
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Konfigürasyon (.env)
Proje ana dizininde `.env` adında bir dosya oluşturun ve `.env.example` dosyasındaki şablonu kullanarak kendi bilgilerinizi girin:

```ini
HOSPITAL_NUMBER=90XXXXXXXXXX@c.us  # Hastane WhatsApp Hattı
USER_NAME=Ad Soyad
USER_TC=11111111111
USER_DOB=01/01/1990
TARGET_DEPT=Endokrinoloji
SPECIFIC_DEPT=             # Opsiyonel: Alt bölüm adı
TARGET_DATE=09.02.2026     # Hedeflenen randevu tarihi
```

### 4. Botu Başlatın
```bash
node main.js
```

Uygulama başladığında terminalde bir **QR Kod** belirecektir. WhatsApp mobil uygulamanızdan "Bağlı Cihazlar" menüsünü kullanarak bu kodu taratın.

## 📂 Proje Yapısı

```
├── lib/
│   ├── messages.js      # Dinamik mesaj şablonları ve yanıtlar
│   └── utils.js         # Yardımcı fonksiyonlar (delay vb.)
├── .env                 # (Gizli) Ortam değişkenleri
├── .gitignore           # Git tarafından yoksayılacak dosyalar
├── main.js              # Ana uygulama ve bot mantığı
└── package.json         # Proje bağımlılıkları
```

## ⚙️ Nasıl Çalışır?

1.  **Başlatma:** Bot, `puppeteer` kullanarak arka planda bir Chrome tarayıcısı açar ve WhatsApp Web'e bağlanır.
2.  **Tetikleme:** Belirlenen periyotlarda hastane numarasına "Menu" mesajı göndererek süreci başlatır.
3.  **Durum Yönetimi (State Machine):** Gelen mesajları analiz eder ve hangi adımda olduğunu (TC girişi, Bölüm seçimi vb.) takip eder.
4.  **Karar Mekanizması:**
    *   Eğer randevu tarihi hedef tarih ile eşleşirse -> **ONAYLA**.
    *   Eğer tarih eşleşmezse -> **İPTAL ET** ve sonraki döngüyü bekle.

## ⚠️ Yasal Uyarı

Bu proje **eğitim ve portföy amaçlı** geliştirilmiştir. Herhangi bir kurumun hizmetlerini aksatmak veya kötüye kullanmak amacı taşımaz. Botun kullanımından doğabilecek sorumluluklar kullanıcıya aittir. Lütfen ilgili kurumun kullanım koşullarına uyunuz.

## 👨‍💻 Geliştirici

**Bulut Emre Sakarya**

- GitHub: @bulutemresakarya
- LinkedIn: linkedin.com/in/bulut-sakarya

---


*Bu proje açık kaynaklıdır ve MIT lisansı ile lisanslanmıştır.*
