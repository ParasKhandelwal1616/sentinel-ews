import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback",
  },
  
  async (accessToken, refreshToken, profile, done) => {
    // Add this at the top of your passport.ts file to see what's happening
console.log("Checking Google Client ID:", process.env.GOOGLE_CLIENT_ID);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ ERROR: Google Credentials missing in .env file!");
}
    try {
      let user = await User.findOne({ email: profile.emails![0].value });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails![0].value,
          password: Math.random().toString(36).slice(-8), // Dummy password
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));