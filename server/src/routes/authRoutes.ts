import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import passport from 'passport';
import  generateToken  from '../utils/generateTocken.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Route 1: Trigger Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route 2: Google Callback (Where Google sends the user back)
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user._id);
    
    // Redirect to frontend with the token in the URL
    // We will catch this token on the frontend dashboard
    res.redirect(`http://localhost:3000/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

export default router;
