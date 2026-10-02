# Answers / Ответы / Жавоблар

Name / Имя / Исм: Javohir

## Part 2 — Bugs / Ошибки / Хатолар

1. Dates show the previous month
   - Cause: `formatDate` da oy `getUTCMonth()` bilan olingan. JavaScript'da oylar 0 dan boshlanadi (yanvar = 0), shuning uchun har bir sana bir oy oldingisini ko'rsatardi.
   - Fix: getUTCMonth() + 1 qildim, shunda oktyabr `10` bo'ladi.
2. Crash when opening order 4000105
   - Cause: 4000105 buyurtmasida `Operations` maydoni umuman yo'q. `getOperations` `order.Operations.results` ga murojaat qilgani uchun `undefined.results` xatosi chiqib, ilova yopilardi.
   - Fix: order.Operations?.results ?? [] yozdim. Operatsiyalar bo'lmasa bo'sh massiv qaytadi.
3. Total hours show `02.51.5`
   - Cause: `PlannedHours` JSON'da satr (`"2.5"`, `"1.5"`). `0 + "2.5" + "1.5"` sonlarni qo'shmaydi, satrlarni ulaydi va `"02.51.5"` chiqadi.
   - Fix: yig'ishda `Number(op.PlannedHours)` ishlatdim. Natija 4 bo'ladi.

## Part 3 — Plant 2000 config

Why the file looks like this:

`plant-2000.json` da faqat 2000 zavodining farqlari bor, qolgan hammasini `default.json` dan oladi. `merge` massivlarni qo'shmaydi, to'liq almashtiradi, shuning uchun `requiredFields` ga standart uchta maydonni ham, `MalfunctionStart` ni ham to'liq yozdim, aks holda standart maydonlar yo'qolardi. `sync` ni yozmadim, shuning uchun u kompaniya standarti (30 daqiqa, 5 MB) bo'yicha qoladi. 1000 zavodining fayli va `default.json` o'zgarmadi.

## Part 4 — Questions / Вопросы / Саволлар

1. Uskuna, xabarnoma va buyurtma `EquipmentId` (18 belgili, boshida nollar bilan) orqali bog'langan: xabarnoma va buyurtma ikkalasida ham shu maydon bor, ya'ni ikkalasi bitta uskunaga tegishli. Uchalasida `Plant` ham bor. Muammo haqidagi xabar va ta'mirlash ishi alohida saqlanadi, chunki ularni turli odamlar va turli vaqtda yaratadi: xabarni istalgan xodim tez va oddiy yozadi, buyurtmani esa rejalashtiruvchi operatsiyalar, ish joylari va soatlar bilan tuzadi. Bitta xabardan bir nechta buyurtma chiqishi yoki hech biri chiqmasligi mumkin, xabarlar esa nosozliklar tarixi sifatida ham kerak. (Ma'lumotlarda buyurtmada xabarnomaga to'g'ridan-to'g'ri havola maydoni ko'rinmadi, shuning uchun bog'lanishni uskuna orqali ko'rdim.)
2. Bu 1970-yil 1-yanvar 00:00 UTC dan o'tgan millisekundlar soni (Unix vaqti). Tizim sanani shunday yuboradi, chunki bu vaqt zonasiga bog'liq emas va lokal formatlardagi chalkashlik yo'q (`05.10.2026` kunmi yoki oymi noaniq). Sonlarni solishtirish va saralash oson, formatlashni esa har bir klient o'z tilida va soat zonasida o'zi qiladi.
3. Tartib bilan tekshiraman: (1) planshetda internet bormi, sinxronizatsiya navbatida yozuv turibdimi, uning holati nima (kutilmoqda yoki xato); (2) ilovadagi sinxronizatsiya logi va xato matni; (3) server yoki OData gateway logida so'rov kelganmi; (4) SAP'da buyurtma holati: boshqa kishi o'zgartirgan (konflikt), bloklangan yoki allaqachon yopilgan emasmi, foydalanuvchida huquq bormi; (5) ma'lumot validatsiyasi va hajm cheklovlari (majburiy maydonlar, `maxAttachmentMb`). Sababi topilgach qayta yuboraman yoki kerak bo'lsa SAP'da qo'lda yakunlayman, ma'lumot yo'qolmasligi kerak.

## Part 5 — Bonus (optional) / Бонус / Бонус

Option (5A / 5B / 5C / 5D): 5B

What I did and why (3–5 sentences):

`bonus/SYNC_DESIGN.md` da offline dizayn yozdim. O'zgarishlar lokal bazaga va "outbox" navbatiga saqlanadi, internet paydo bo'lganda fon vazifasi ularni birma-bir yuboradi, har bir yozuvga noyob kalit beriladi (qayta yuborish xavfsiz bo'lishi uchun). Yuborishda planshet bilgan versiya serverdagi bilan solishtiriladi: SAP'da o'sha buyurtma o'zgargan bo'lsa, kesishmaydigan maydonlar birlashtiriladi, kesishsa yoki buyurtma yopilgan bo'lsa foydalanuvchiga ikkala variant ko'rsatiladi va u tanlaydi. "Oxirgi yozgan yutadi" qoidasini ishlatmadim, chunki u texnikning ishini jimgina yo'qotishi mumkin. Bu mavzuni Android'dagi Room va WorkManager tajribamga tayanib tanladim.
