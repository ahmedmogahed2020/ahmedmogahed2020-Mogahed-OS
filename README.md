# Mogahed OS

Mogahed OS هو Web App عربي RTL لإدارة الحياة والعمل والتركيز والمعرفة وتحليل الحملات الإعلانية.

## المميزات

- App Shell منظم ومقسم إلى ملفات HTML/CSS/JS.
- Vanilla JavaScript بدون React وبدون Backend.
- LocalStorage مع تصدير واستيراد JSON.
- Mobile First وRTL Arabic.
- أقسام: الرئيسية، الأهداف، المشاريع، المهام، المعرفة، الطوارئ، القرارات، المراجعات، الفوز، Dashboard، تحليل الحملات، البحث، النسخ الاحتياطي.
- Dashboard محسوب من البيانات الحقيقية.
- تحليل حملات يحسب الاستثمار، نقطة التعادل، الربح، ROAS، CPA، Margin، المخاطرة وسيناريوهات التسعير.

## التشغيل المحلي

افتح `index.html` مباشرة في المتصفح، أو شغل سيرفر محلي بسيط:

```bash
python -m http.server 8080
```

ثم افتح:

```text
http://localhost:8080
```

## الرفع على GitHub Pages

1. أنشئ Repository جديد باسم `mogahed-os`.
2. ارفع كل الملفات والمجلدات كما هي.
3. من GitHub: Settings → Pages.
4. اختر Branch: `main` وFolder: `/root`.
5. اضغط Save.
6. افتح رابط GitHub Pages بعد ظهوره.

## ملاحظات تقنية

- البيانات تحفظ في LocalStorage على نفس المتصفح.
- يجب تصدير نسخة JSON دوريًا قبل مسح المتصفح أو تغيير الجهاز.
- لا توجد مفاتيح API أو Backend في النسخة الأولى.
