const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const readline = require('readline');
require('dotenv').config();
const BookingMessages = require('./lib/messages');
const { delay } = require('./lib/utils');

// --- AYARLAR ---
const HOSPITAL_NUMBER = process.env.HOSPITAL_NUMBER; // Hastanenin WhatsApp numarası .env dosyasından alınır
let MY_TC = ''; // Ekrandaki TC
let MY_DOB = '';           // Ekrandaki Doğum Tarihi
let DEPARTMENT = '';
let TARGET_DATE = '';      // İstenen Randevu Tarihi (Gün.Ay.Yıl)
let SPECIFIC_DEPARTMENT = ''; // Çoklu sonuçta aranacak spesifik kelime
let name = ''; // Ekrandaki İsim Soyisim

// Bot Durum Kontrolü (State Management)
let isBookingActive = false;
let lastStep = 'IDLE'; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true } // Arka planda çalışsın
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Kodu taratın...');
});

client.on('ready', () => {
    console.log('Bot Hazır! Saat başı kontrol başlatılıyor...');
    
    // İlk kontrolü hemen yap, sonra interval'e gir
    startBookingProcess();

    // Saat başı (900000 ms) tekrarla
    setInterval(() => {
        console.log('Saatlik kontrol başlıyor...');
        startBookingProcess();
    }, 900000); 
});

// Süreci başlatan fonksiyon
function startBookingProcess() {
    isBookingActive = true;
    lastStep = 'START';
    // Menüyü tetiklemek için bir şey yazıyoruz
    client.sendMessage(HOSPITAL_NUMBER, 'Menu');
}

// Gelen mesajları dinleyen ve cevap veren ana mantık
client.on('message', async msg => {
    // Sadece hastane numarasından gelen mesajlara bak
    if (msg.from !== HOSPITAL_NUMBER || !isBookingActive) return;

    // Mesaj şablonlarını al (Değişkenleri içeri gönderiyoruz)
    const msgs = BookingMessages({ 
        name, 
        tc: MY_TC, 
        department: DEPARTMENT 
    }); 
    
    const content = msg.body.toLowerCase(); // Küçük harfe çevir ki kontrol kolay olsun

    console.log('Gelen Mesaj:', msg.body.toLocaleLowerCase());

    // SONUÇ: Randevu Alındı - Tarih Kontrolü ve İptal Döngüsü
    // Şablondaki metni veya genel başarı ifadesini kontrol et
    if ((content.includes(msgs.randevuBasarili.toLowerCase()) || (content.includes('randevu bilgileriniz') && content.includes('tarih:')))) {
        // Mesajın içinden tarihi çek (Örn: Tarih: 09.02.2026)
        const dateMatch = msg.body.match(/Tarih:\s*(\d{2}\.\d{2}\.\d{4})/i);
        
        if (dateMatch) {
            const bookedDate = dateMatch[1];
            console.log(`Randevu Alındı: ${bookedDate} | İstenen: ${TARGET_DATE}`);

            if (bookedDate === TARGET_DATE) {
                console.log('!!! HEDEF TARİH YAKALANDI !!! İşlem Başarılı.');
                isBookingActive = false; // Başarılı olduğu için durdur
            } else {
                console.log('İstenen tarih değil. Randevu iptal ediliyor ve tekrar denenecek...');
                await delay(3000);
                msg.reply('İPTAL');
                isBookingActive = false; // Döngüyü bitir, setInterval bir sonraki turda tekrar başlatacak
            }
        }
        return;
    }

    if (msg.from !== HOSPITAL_NUMBER || !isBookingActive) return;
    
    // Adım 1: Menü geldi, Randevu Alma (1) seç
    if (content.includes(msgs.MENU.toLowerCase()) || content.includes(msgs.MENU2.toLowerCase())) {
        await delay(2000); // İnsan gibi görünmek için bekle
        msg.reply('1');
        lastStep = 'SENT_MENU_SELECTION';
    }
    
    // Adım 2: TC İstendi
    if (content.includes(msgs.tcSorgu.toLowerCase())) {
        await delay(2000);
        msg.reply(MY_TC);
        lastStep = 'SENT_TC';
    }

    // Adım 3: Doğum Tarihi İstendi
    if (content.includes(msgs.dgSorgu.toLowerCase())) {
        await delay(2000);
        msg.reply(MY_DOB);
        lastStep = 'SENT_DOB';
    }
    
    // SONUÇ: Başarısız
    if (content.includes(msgs.randevuAlinamadi.toLowerCase())) {
        console.log('Sonuç: Randevu YOK. Bir sonraki saat denenecek.');
        isBookingActive = false;
        await delay(2000);
        lastStep = 'IDLE';
        }             
        
    // Adım 4: Bölüm Adı İstendi (İsim teyidinden sonra gelir)
    if (content.includes(msgs.isLOGGED.toLowerCase())) {
        await delay(2000);
        msg.reply(DEPARTMENT);
        lastStep = 'SENT_DEPT';
    }

    // Adım 4.5: Birden Fazla Bölüm Bulundu (Bölüm Seçimi)
    if (content.includes(msgs.bolumSecimi.toLowerCase()) || content.includes('birden fazla bölüm bulundu')) {
        console.log('Birden fazla bölüm bulundu.');
        let indexToSelect = '1';

        if (SPECIFIC_DEPARTMENT) {
            // Listede spesifik kelimeyi ara. Format: *1-)* Bölüm Adı
            // Önce spesifik formatı (*1-)*) dene, olmazsa genel sayı yakalamayı dene.
            let match = msg.body.match(new RegExp(`\\*(\\d+)-\\)\\*[^\\n]*${SPECIFIC_DEPARTMENT}`, 'i'));
            
            if (!match) {
                match = msg.body.match(new RegExp(`(\\d+)[^\\n]*${SPECIFIC_DEPARTMENT}`, 'i'));
            }
            
            if (match) {
                indexToSelect = match[1];
                console.log(`Kelime eşleşmesi (${SPECIFIC_DEPARTMENT}) bulundu. Seçilen Sıra: ${indexToSelect}`);
            }
        }

        console.log(`${indexToSelect}. sıradaki seçiliyor...`);
        await delay(2000);
        msg.reply(indexToSelect);
        lastStep = 'SENT_DEPT_INDEX';
    }

    // Adım 5: Bölüm Onayı (... bölümüne mi...?)
    if (content.includes(msgs.randevuOnay.toLowerCase())) {
        await delay(2000);
        msg.reply('Evet');
        lastStep = 'CONFIRM_DEPT';
    }

    // Adım 6: Son Onay (Oluşturulacaktır onaylıyor musunuz?)
    if (content.includes(msgs.randevuOnay2.toLowerCase())) {
        await delay(2000);
        msg.reply('Evet');
        lastStep = 'FINAL_CONFIRM';
    }

    
    
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function init() {
    console.log('--- RANDEVU BOTU AYARLARI ---');

    // Çevresel değişken varsa onu kullan, yoksa kullanıcıya sor
    const getInfo = async (envVar, question) => {
        return process.env[envVar] ? process.env[envVar] : await ask(question);
    };

    name = await getInfo('USER_NAME', 'İsim Soyisim (örn: bulut emre sakarya): ');
    MY_TC = await getInfo('USER_TC', 'TC Kimlik No: ');
    MY_DOB = await getInfo('USER_DOB', 'Doğum Tarihi (GG/AA/YYYY): ');
    DEPARTMENT = await getInfo('TARGET_DEPT', 'Bölüm (Örn: endokrin): ');
    SPECIFIC_DEPARTMENT = await getInfo('SPECIFIC_DEPT', 'Spesifik Bölüm Adı (Çoklu sonuçta bu kelimeyi içeren sıra seçilsin - Opsiyonel): ');
    TARGET_DATE = await getInfo('TARGET_DATE', 'Hedef Tarih (GG.AA.YYYY): ');
    rl.close();
    console.log('Bilgiler alındı, WhatsApp başlatılıyor...');
    client.initialize();
}

init();