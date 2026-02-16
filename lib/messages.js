module.exports = function BookingMessages({ name, tc, department }) {
    const MENU = `*[HOŞGELDİNİZ]*

[HASTANE ADI] WhatsApp Randevu Servisi'ne hoşgeldiniz. Lütfen yapmak istediğiniz *işlemin numarasını* yazınız.`;
    const MENU2 = `*[MENÜ]*

Lütfen yapmak istediğiniz *işlemin numarasını* yazınız.`;

    const isLOGGED = `Sayın *${name}*, lütfen randevu almak istediğiniz *bölümün adını* yazınız.

Başka bir kişi adına işlem yapmak için *0* yazınız.`;
    const randevuOnay = ` bölümüne mi randevu almak istiyorsunuz?`;
    const randevuOnay2 = `için randevu oluşturulacaktır. Onaylıyor musunuz?`;
    const randevuAlinamadi = `*[RANDEVU ALINAMADI]*

*Uygun tarih bulunamadı.*.

Lütfen randevu almak istediğiniz *bölümün adını* yazınız.`;
    const tcSorgu = `Randevu almak için lütfen *TC KİMLİK NUMARANIZI* yazınız.`;
    const dgSorgu = `Lütfen *DOĞUM TARİHİNİZİ* örnekte belirtildiği şekilde yazınız. *Örnek: 24/07/1984*`;
    const hataliGiris = `*[HATALI GİRİŞ]*

TC kimlik numaranızı veya doğum tarihinizi *yanlış girdiniz.*

Lütfen *TC KİMLİK NUMARANIZI* kontrol ederek tekrar yazınız.`;
    const randevuBasarili = `*[RANDEVU ALINDI]*

Randevunuz başarıyla oluşturulmuştur. Randevu bilgileriniz aşağıdaki gibidir:

*Adı Soyadı:* ${name}
*TC Kimlik No:* ${tc}
*Bölüm:* *${department}*`;
    const bolumSecimi = `*[BÖLÜM SEÇİMİ]*

Seçtiğiniz kelimeyle eşleşen birden fazla bölüm bulundu.

Lütfen randevu almak istediğiniz bölümün *sıra numarasını* yazınız.`;

    return {
        MENU,
        MENU2,
        isLOGGED,
        randevuOnay,
        randevuOnay2,
        randevuAlinamadi,
        tcSorgu,
        dgSorgu,
        hataliGiris,
        randevuBasarili,
        bolumSecimi
    };
};
