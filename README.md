# Mogahed OS — V83 QA Harness (GitHub Ready)

نسخة مقسمة من `Mogahed_OS_V83_QA_Harness.html` ومجهزة للرفع على GitHub كـ static site.

## التشغيل المحلي

افتح `index.html` مباشرة في المتصفح، أو شغل سيرفر محلي:

```bash
python3 -m http.server 8000
```

ثم افتح:

```text
http://localhost:8000
```

## هيكل المشروع

```text
Mogahed_OS_GitHub_Ready/
├── index.html
├── assets/
│   ├── css/        # CSS مستخرج بنفس ترتيب الملف الأصلي
│   ├── js/         # JavaScript مستخرج بنفس ترتيب الملف الأصلي
│   └── img/        # مكان الصور المستقبلية
├── docs/
│   ├── STRUCTURE.md
│   ├── QA_CHECKLIST.md
│   └── asset-manifest.json
├── tools/
│   └── check-js.sh
├── package.json
└── .gitignore
```

## قواعد الصيانة المهمة

1. لا تغيّر ترتيب ملفات JavaScript إلا بعد اختبار شامل، لأن النظام مبني على باتشات متتابعة.
2. عند تعديل CSS، ابحث عن اسم ملف الباتش المناسب داخل `assets/css`.
3. عند تعديل Feature قديمة، غالبًا ستجدها في ملف JS يحمل اسم الإصدار أو الباتش.
4. بعد أي تعديل شغل:

```bash
npm run check
```

5. افتح التطبيق وشغل `Run System Test` من داخل System Health.

## ملاحظة أمان

لا ترفع أي مفاتيح API داخل الكود أو داخل localStorage export. مفاتيح Gemini/Claude يجب أن تظل محلية فقط.


## V83.33 Campaign Analysis
- تم إضافة قسم "تحليل الحملات الاعلانيه" داخل قائمة المزيد.
- تم دمج ملف `tools/pricing_calculator.html` وتشغيله من داخل Mogahed OS عبر صفحة مستقلة مدمجة.


## V88 Dashboard Intelligence

- Added an intelligent dashboard command center connected to tasks, actions, goals, knowledge, wins, reviews, decisions, inbox and finance.
- Added system health score, KPIs, charts, 7-day activity, insights, scenarios, timeline and quick navigation.
- This stage does not replace the future full tasks/goals recurring system; that remains for V89.
