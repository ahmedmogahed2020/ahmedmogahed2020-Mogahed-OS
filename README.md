# Mogahed OS — GitHub Pages Release Candidate 1.31

نسخة إنتاجية مرشحة للاستخدام الشخصي اليومي بعد تنظيف مراحل الواجهة، المعرفة، النسخ الاحتياطي، الاختبار، تدفق اليوم، المهام، والمراجعة.

## تشغيل سريع

1. افتح `index.html` مباشرة في المتصفح أو ارفعه على GitHub Pages.
2. افتح صفحة **النسخ الاحتياطي** وصدّر JSON قبل أي تجربة كبيرة.
3. من **System Health** شغّل اختبار النظام بعد أول تشغيل.
4. لو هتستخدم Supabase، أدخل URL و Anon Key من صفحة النسخ الاحتياطي ثم جرّب رفع نسخة اختبارية.

## الملفات الأساسية

```text
index.html
css/
js/
assets/
README.md
CHANGELOG.md
RELEASE_NOTES.md
USER_GUIDE.md
```

## ما تم تثبيته في هذه النسخة

- الصفحة الرئيسية كمركز تنفيذ يومي.
- المهام مع وقت واضح وتنبيهات مفهومة.
- مراجعة نهاية اليوم مرتبطة بالتنفيذ.
- المعرفة مقسمة داخليًا لتقليل خطر الكسر.
- النسخ الاحتياطي أوضح بين JSON و Google Drive و Supabase.
- System Health يحتوي Regression Harness شامل.
- تنظيف نصوص الإصدارات القديمة من الواجهة لصالح تجربة إنتاجية أنظف.

## قواعد الاستخدام الآمن

- لا تحفظ ملفات PDF أو صور كبيرة محليًا لفترة طويلة؛ استخدم Supabase Storage عند الحاجة.
- صدّر JSON قبل مسح بيانات المتصفح أو تغيير الجهاز.
- لا تضع مفاتيح خاصة أو Service Role Key داخل الواجهة. استخدم Anon Key فقط.
- عند تعديل الكود، شغّل اختبار النظام من داخل التطبيق بعد التعديل.

## حالة النسخة

**GitHub Pages Release Candidate 1.31** — مناسبة للتجربة الجادة والرفع على GitHub Pages، مع بقاء التحذيرات المتوقعة إذا لم يتم تفعيل YouTube API أو Supabase أو Google Drive.


## النشر على GitHub Pages

هذه النسخة مجهزة للنشر المباشر على GitHub Pages.

الملفات المهمة قبل الرفع:

```text
index.html
css/
js/
assets/
.nojekyll
GITHUB_PAGES_DEPLOYMENT.md
DEPLOYMENT_CHECKLIST.md
```

راجع `GITHUB_PAGES_DEPLOYMENT.md` للخطوات المختصرة، وراجع `DEPLOYMENT_CHECKLIST.md` قبل وبعد النشر.
