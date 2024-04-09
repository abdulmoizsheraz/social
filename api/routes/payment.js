import express from 'express';
import { db } from "../connect.js";

import jwt from 'jsonwebtoken';

const router = express.Router();

export const verifyPayment = (req, res) => {
   let cardNumber="4242 4242 4242 4242"
     let cvc="321";
   let  expiryDate="12/34"
    if (!cardNumber || !cvc || !expiryDate) {
        return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    const token = req.cookies.accessToken;
    console.log(token)
    if (!token) return res.status(401).json({ success: false, message: "Not logged in!" });

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json({ success: false, message: "Token is not valid!" });

        const userId = userInfo.id;

        const updateQuery = "UPDATE users SET isVerifyPayment = true WHERE id = ?";
        db.query(updateQuery, [userId], (error, results, fields) => {
            if (error) {
                console.error("Error updating isVerifyPayment in database:", error);
                return res.status(500).json({ success: false, message: 'Internal server error.' });
            }
            return res.json({ success: true, message: 'Payment details verified successfully. isVerifyPayment updated in database.' });
        });
    });
};

router.post('/', verifyPayment);

export default router;
