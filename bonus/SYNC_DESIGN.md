# Offline ishlash: sinxronizatsiya dizayni (5B)

## Maqsad
Texnik internetsiz sexda buyurtma va xabarnomalar bilan ishlaydi. Hech narsa yo'qolmaydi, internet paydo bo'lgach o'zgarishlar SAP'ga yuboriladi.

## 1. Lokal saqlash
- Planshetda lokal baza (Android'da Room/SQLite). UI faqat shu bazadan o'qiydi va yozadi, tarmoqqa to'g'ridan-to'g'ri murojaat qilmaydi.
- Server ma'lumoti (buyurtmalar, uskunalar) bazaga nusxalanadi. Har bir buyurtma bilan serverdan kelgan **versiya** (ETag yoki oxirgi o'zgarish vaqti) saqlanadi.
- Foydalanuvchi o'zgartirsa, buyurtma lokal yangilanadi va **outbox** (chiqish navbati) jadvaliga yozuv qo'shiladi: `id`, `buyurtma`, `amal` (masalan "yakunlash"), `ma'lumot`, `asos bo'lgan versiya`, `holat` (kutilmoqda / yuborilmoqda / xato / konflikt), `vaqt`.
- Navbat tartib bilan, birma-bir yuboriladi. Har bir yozuvga noyob `idempotency key` beriladi, shunda qayta yuborish (tarmoq uzilsa) ikki marta bajarilmaydi.

## 2. Yuborish
- Internet paydo bo'lganda yoki davriy (`sync.intervalMinutes`) fon vazifasi (WorkManager) navbatni yuboradi.
- Vaqtinchalik xato (tarmoq, 5xx): eksponensial kutish bilan qayta uriniladi.
- Doimiy xato (4xx, validatsiya): yozuv "xato" holatida qoladi, foydalanuvchiga ko'rsatiladi. Yozuv hech qachon jimgina o'chirilmaydi.
- Foydalanuvchi har bir buyurtmada "yuborilmagan" belgisini ko'radi.

## 3. Offline paytida SAP'da o'zgartirilgan buyurtma (konflikt)
Yuborishda `asos bo'lgan versiya` serverdagi joriy versiya bilan solishtiriladi (`If-Match`):
- **Versiya bir xil:** o'zgarish qabul qilinadi.
- **Versiya farq qiladi, lekin o'zgargan maydonlar kesishmaydi** (masalan, planshetda operatsiya tugatilgan, SAP'da faqat matn o'zgargan): maydonlar bo'yicha avtomatik birlashtiriladi.
- **Bir xil maydon o'zgargan yoki buyurtma SAP'da yopilgan (TECO/CLSD):** avtomatik hal qilinmaydi. Yozuv "konflikt" holatiga o'tadi va foydalanuvchiga ikkala variant (planshetdagi va SAP'dagi) ko'rsatiladi. U "meniki", "SAP'niki" yoki qo'lda birlashtirishni tanlaydi.
- SAP'dagi ma'lumot ustun hisoblanadi, chunki bu yagona haqiqat manbai. Oxirgi yozgan yutadi (last-write-wins) qoidasi texnik ish tarixini yo'qotishi mumkin, shuning uchun uni ishlatmaymiz.

## 4. Kichik misol (psevdokod)
```
for item in outbox.pending():
    resp = api.send(item, ifMatch=item.baseVersion, key=item.id)
    if resp.ok:        outbox.done(item); local.update(resp.newVersion)
    elif resp.conflict: outbox.markConflict(item, resp.serverState)
    elif resp.retryable: outbox.retryLater(item)
    else:              outbox.markFailed(item, resp.error)
```
