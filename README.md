backend-project/
├── config/
│   ├── config.js              # הגדרות של משתנים (כמו סיסמאות וגישה למסד נתונים)
├── middleware/
│   ├── authMiddleware.js      # middleware לאימות (Authentication) ובדיקת הרשאות
├── model/
│   ├── auth.js                # מודל auth, המנהל את נתוני המשתמשים
│   ├── users.js               # מודל למשתמשים (כמו שמירה וקריאה של משתמשים)
│   └── cards.js               # מודל לכרטיסי עסקים
├── routes/
│   ├── auth.js                # נתיבי התחברות ורישום משתמשים
│   ├── users.js               # נתיבים לניהול מידע על משתמשים
│   └── cards.js               # נתיבים לניהול כרטיסי עסקים
├── seed.js                    # קובץ לדימוי נתונים (כמו יצירת כרטיסים ומשתמשים לדימוי)
├── userData.json              # נתוני משתמשים לדימוי
├── cardData.json              # נתוני כרטיסי עסקים לדימוי
├── app.js                     # הגדרת אפליקציה, חיבור למסד נתונים
├── .envExample                # קובץ דוגמה של משתני סביבה, להכנסת ערכים לדימוי
├── .env                       # קובץ הגדרות הסביבה עם נתונים חשובים (לא נכנס לגיטמה לאחסון)
└── package.json               # הגדרת התלויות והסקריפטים של הפרויקט


התקנה
שכפלו את הריפוזיטורי.
הריצו את הפקודה npm install כדי להתקין את כל התלויות.
צרו קובץ .env עם המשתנים הבאים:

JWT_KEY=המפתח_שלך_ל-JWT
CONNECTION_ATLAS=חיבור_המונגו_שלך
התחילו את השרת:

1.config.js => {

הקובץ הזה אחראי לניהול משתנים סודיים וחשובים לצורך הפעלת האפליקציה.

configError(message): הפונקציה הזו מקבלת הודעת שגיאה ומבצעת זריקת שגיאה (throw) במקרה שהמשתנה לא נמצא או לא הוגדר כראוי.

jwtKey: כאן אנחנו מוודאים שJWT_KEY (המשתמש במפתח סודי לצורך יצירה וודאות של טוקנים) מוגדר בקובץ ההגדרות של הסביבה (כמו ב-.env). אם לא נמצא המפתח הסודי, יש שגיאה שתמנע מהאפליקציה לפעול.
} ,

2.authMiddleware.js =>{
    הקובץ הזה משמש כmiddleware לצורך אימות טוקנים (JWT). המטרה היא לוודא שהמשתמש מחובר ויש לו את הזכויות הגישה המתאימות לפני שהוא יכול להפעיל פעולות מסוימות (למשל, גישה לנתיבים פרטיים).

אחזור הטוקן: המילדות בודק אם יש טוקן בהכותרות של הבקשה (הכותרת יכולה להיות "x-auth-token" או "Authorization" עם טוקן מסוג Bearer).

אימות הטוקן: אם נמצא טוקן, המילדות מאמת את הטוקן על ידי שימוש במפתח הסודי שנמצא ב-config.js.

טיפול בשגיאות: אם הטוקן לא נמצא, לא תקף או פג תוקפו, המילדות מחזיר הודעות שגיאה מתאימות (כגון: "הגישה נדחתה" או "הטוקן פג תוקף").

ממשק למשתמש: אם האימות הצליח, המילדות מצרף את המידע של המשתמש אל הבקשה (כדי שיהיה זמין בקוד הבא).

}

// Model related files : 

auth.js =>{    
        המודל הזה עוסק בניהול ההזדהות של המשתמשים במערכת. הוא מגדיר סכמה של 
"Auth" באמצעות Mongoose, שבה ישנם שני שדות עיקריים:  
email - כתובת דוא"ל של המשתמש (חובה להיות ייחודית). 
password - סיסמת המשתמש.
בנוסף, יש פונקציה בשם validateAuth שבודקת את תקינות הנתונים שהוזנו על ידי המשתמש, כולל וידוא שהדוא"ל תקני והסיסמה עומדת בדרישות מסוימות.


}
cards.js  => {
    מודל זה עוסק בכרטיסי עסקים (Business Cards) במערכת. הסכמה כוללת מספר שדות כמו:

title - כותרת הכרטיס.
subtitle - תת-כותרת של הכרטיס.
description - תיאור הכרטיס.
phone - מספר הטלפון של העסק (יש לו תקן תקני).
email - דוא"ל של העסק.
web - אתר אינטרנט של העסק.
image - קישור לתמונה של הכרטיס.
address - כתובת העסק.
likes - רשימה של משתמשים שאהבו את הכרטיס.
user_id - מזהה המשתמש שהעלה את הכרטיס.
בנוסף, ישנה פונקציה בשם generateBizNumber שמייצרת מספר עסק ייחודי (bizNumber) לאחר בדיקה אם הוא כבר קיים.

המודל עושה שימוש גם ב-Schema נפרד עבור כתובת (Address) ותמונה (Image) ומשתמש בהם בתוך כרטיס העסק.


}
users.js =>{
    users.js
מודל זה עוסק בניהול המידע של המשתמשים במערכת. הסכמה כוללת את השדות:

name - שם המשתמש (שם פרטי, אמצעי ושם משפחה).
phone - מספר טלפון של המשתמש (צריך לעמוד בתקן).
email - דוא"ל של המשתמש.
password - סיסמת המשתמש.
image - תמונת פרופיל של המשתמש.
address - כתובת של המשתמש (כוללת מדינה, עיר, רחוב, מספר בית ומיקוד).
isAdmin - האם המשתמש הוא מנהל.
isBusiness - האם המשתמש הוא בעל עסק.
בנוסף, ישנה פונקציה validateUser שבודקת את תקינות המידע שהוזן בעת יצירת משתמש חדש או עדכון של פרטי משתמש.

כל המודלים משתמשים ב-Joi לבדיקת תקינות הנתונים לפני השמירה בבסיס הנתונים, והם משולבים במערכת לניהול משתמשים, כרטיסי עסקים ואותנטיקציה.

}


//routes related fies : 

auth.js =>{
    הקוד שמופיע הוא של שרת Express שמשתמש ב-MongoDB ומטפל ברישום כניסה של משתמשים לאפליקציה באמצעות JWT (JSON Web Token). להלן הסבר על כל חלק בקוד:

הדרישות (require):

express: מודול שמספק ממשק API פשוט ליצירת שרתים.
bcrypt: ספרייה עבור חסימת סיסמאות (hashing) לצורך אבטחה.
jsonwebtoken: ספרייה ליצירת ולוודא JWT.
{ Auth } ו- { User, validateUser }: מודולים מותאמים אישית שנמצאים בתיקיית model לטיפול במודלים של משתמשים ואימות הנתונים.
config: קובץ הגדרות המכיל את המפתח הסודי של JWT.
הגדרת מסלול (router):

נוצר אובייקט router מ-Express, שיאפשר את הגדרת המסלולים (routes) השונים.
רישום משתמש (/register):

מקבלים את פרטי המשתמש מתוך הבקשה (request body).
מאמתים את פרטי המשתמש באמצעות פונקציה validateUser.
אם יש טעות באימות, מחזירים שגיאה עם קוד 400.
בודקים אם יש כבר משתמש עם אותו דוא"ל במסד הנתונים (User.findOne({ email })).
אם כן, מחזירים שגיאה עם הודעת "User already registered".
אם המשתמש לא נמצא, החספנו את הסיסמה שנשלחה מהמשתמש (bcrypt.hash) ושומרים את המשתמש במסד הנתונים (new User(userData)).
לאחר מכן, יוצרים אובייקט Auth (שכולל את המייל והסיסמה החסומה) ושומרים אותו גם כן במסד הנתונים.
מחזירים תשובה עם קוד 201 (משתמש נרשם בהצלחה).
כניסת משתמש (/login):

מקבלים את הדוא"ל והסיסמה מתוך הבקשה.
בודקים אם המייל קיים במסד הנתונים של Auth.
אם לא, מחזירים שגיאה עם הודעת "Invalid email or password".
אם המייל נמצא, מבצעים השוואה בין הסיסמה שהוזנה לבין הסיסמה החסומה שנשמרה במסד הנתונים בעזרת bcrypt.compare.
אם הסיסמה לא תואמת, מחזירים שגיאה עם הודעת "Invalid email or password".
אם הסיסמה נכונה, יוצרים JWT עם המייל של המשתמש ומחזירים אותו בבקשה. זה מאפשר למשתמש לבצע קריאות API מאובטחות בעתיד על ידי הצגת הטוקן הזה.
ייצוא (module.exports):

בסופו של דבר, השרת חשוף למסלולים אלה (/register ו-/login), אותם ניתן להשתמש בהם במקומות אחרים במערכת.
בקצרה, הקוד מאפשר למשתמש להירשם ולבצע כניסה באמצעות אימות נתונים וסיסמאות חסומות, תוך שימוש בטוקן JWT לאימות עתידי.
}

cardRoute =>{

    הקוד מציין את מסלולי ה-API עבור ניהול כרטיסי עסקים. הנה ההסבר המהיר:

GET / - מחזיר את כל הכרטיסים.
GET /:id - מחזיר כרטיס ספציפי לפי מזהה.
GET /my-cards/:userId - מחזיר את כל הכרטיסים של משתמש לפי מזהה המשתמש.
POST / - יוצר כרטיס חדש (כולל אימות ושמירת כתובת ודימוי אם נדרש).
PUT /:id - מעדכן כרטיס קיים (מעודכן שדות לפי הנתונים החדשים).
PATCH /like/:id - מוסיף או מסיר לייק לכרטיס.
DELETE /:id - מוחק כרטיס בהתאם למזהה, לאחר אימות שהמשתמש הוא בעל הכרטיס.
כל המסלולים משתמשים ב-Mongoose כדי לבצע את הפעולות על מסד הנתונים, כולל אימות כתובת ודימוי.
}

userRoute =>{
 הקוד מספק את המסלולים עבור ניהול משתמשים. הנה הסבר קצר על כל אחד מהם:

GET /:id - מחזיר משתמש לפי מזהה.
GET / - מחזיר את כל המשתמשים.
PUT /:id - מעדכן את פרטי המשתמש (כולל שם, טלפון, כתובת, תמונה, וכו'). המידע המתקבל מאומת בעזרת Joi.
PATCH /:id - מעדכן את מצב ה-"isBusiness" של המשתמש, עם טיפול נכון בשדה (אם הוא נשלח כסטראינג הוא מומר לבוליאני).
DELETE /:id - מוחק את המשתמש לפי מזהה.
הקוד עושה שימוש ב-Lodash כדי להימנע משינויים בשדה createdAt ולהחזיר רק את השדות הרלוונטיים בתגובה.
   
}
_____________________________________________________________________

1.env - מכיל את הערכים הסודיים שישמשו את האפליקציה בזמן הריצה:

JWT_KEY - מפתח סודי שנעשה בו שימוש לחתימה ולאימות של JSON Web Tokens (JWT).
CONNECTION_ATLAS - URL להתחברות למסד נתונים MongoDB דרך Atlas, המאפשר חיבור מבוסס ענן.
2.env.example - דוגמה לקובץ .env המכיל את שם המפתח בלבד. בדרך כלל, הוא לא כולל את הערכים הסודיים, אלא רק את המפתחות עצמם כדי שהמפתחיים יידעו איזה ערכים להוסיף בקובץ .env שלהם.

_____________________________________________________________________

app.js 

הגדרת משתנים:
PORT: היציאה שהשרת יאזין לה (3005).
process.env: מבצע טעינת משתנים מתוך קובץ .env שמכיל מידע סודי כמו מפתחות API או פרטי חיבור למסד נתונים.
חיבור למסד נתונים:
אנו משתמשים ב-mongoose.connect כדי להתחבר למסד הנתונים שנמצא ב-CONNECTION_ATLAS (MongoDB).
הגדרת שרת Express:
נשתמש ב-Express כדי לנהל את בקשות ה-API השונות. הרוטים שהגדרנו הם:
/api/users: לטיפול במשתמשים.
/api/auth: לטיפול בהזדהות (login/logout).
/api/cards: לטיפול בכרטיסים.
שימוש ב-Morgan: זהו middleware שמדפיס את המידע של הבקשות לכלול את הדיבוג (debugging).

seed.js

הגדרת משתנים:
הגדרת קישורים למסדי הנתונים, עבודה עם קובצי JSON שמכילים נתוני משתמשים וכרטיסים, וטעינת מודולים נוספים (כמו bcrypt).
חיבור למסד נתונים:
מגדירים חיבור למסד הנתונים עם MongoDB, אם יש בעיה בהתחברות, תוצג הודעת שגיאה.
השתלת נתונים:
מוחקים את הנתונים הישנים (אם קיימים) ומשתילים נתונים חדשים שנמצאים בקובצי JSON.
המידע למשתמשים והכרטיסים מקובץ ה-JSON מועבר למסד הנתונים, כאשר הסיסמאות של המשתמשים מאוחסנות בצורה מאובטחת (hashed) בעזרת bcrypt.
מבצע יצירת כרטיסים עבור כל עסק, עם קישור  למשתמש ולכתובת
postman: 
הפרויקט שכולל את הקבצים שציינת נראה כפרויקט Backend שנבנה עם תיקיות שמיועדות למודלים, נתיבים, אמצעי אחסון של מידע (כמו קבצי JSON), וקובץ app.js שכנראה מכיל את ההגדרות המרכזיות של האפליקציה.

בין התיקיות שמופיעות, יש לך תיקיית postman שמכילה את הקובץ backend-project.postman_collection.json. הקובץ הזה הוא אוסף של בקשות שנעשו דרך Postman לצורך בדיקה של ה-API שלך. הוא מכיל את הבקשות השונות שהגדרת כדי לבדוק את הממשק, כולל בקשות GET, POST, PUT ו-DELETE שנשלחו לנתיבים השונים.

 (UserData.json) -ו (cardData.json):

UserData.json:
הקובץ מכיל רשימה של משתמשים עם נתונים כמו שם, טלפון, דוא"ל, סיסמה, כתובת וסטטוס "עסק" (isBusiness).
כל משתמש מקבל פרטי כתובת ייחודיים ונתוני הזדהות.

cardData.json:
הקובץ מכיל רשימה של כרטיסי עסקים עם נתונים כמו כותרת, תיאור, טלפון, דוא"ל, כתובת וכתובת אינטרנט.
<<<<<<< HEAD
<<<<<<< HEAD
כל כרטיס כולל תמונה וכתובת שנשמרים במסד הנתונים.
=======
כל כרטיס כולל תמונה וכתובת שנשמרים במסד הנתונים.
>>>>>>> 005092b3c8ee5d9d6fd4fcd756f642529b3a2139
=======
כל כרטיס כולל תמונה וכתובת שנשמרים במסד הנתונים.
>>>>>>> 90ff9e0307b0565b8a802fe44d038f0073776111
