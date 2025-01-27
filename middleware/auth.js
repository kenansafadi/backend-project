const jwt = require("jsonwebtoken");
const config = require("../config/config");

module.exports = (req, res, next) => {
    // קבלת הטוקן מתוך הכותרות (תומך ב'x-auth-token' או 'Authorization: Bearer <token>')
    const token = req.header("x-auth-token") || req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).send("Access denied. No token provided.");
        return;
    }

    try {
        // אימות הטוקן
        const payload = jwt.verify(token, config.jwtKey); // שימוש ב-config.jwtKey



        // הוספת הנתונים מהטוקן לאובייקט הבקשה לשימוש בהמשך
        req.user = payload;

        // העברת השליטה למידלוור או לטיפול הבא
        next();
    } catch (error) {

        // טיפול בשגיאות ספציפיות של JWT
        if (error.name === "TokenExpiredError") {
            res.status(401).send("Token expired. Please log in again.");
        } else {
            console.error("Token verification failed:", error.message); // לוג של השגיאה לצורך ניפוי באגים
            res.status(400).send("Invalid token.");
        }
    }
};
