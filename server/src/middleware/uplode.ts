import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Authenticate with your Cloud credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure the Cloudinary Storage Bucket
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sentinel-evidence', // This folder will auto-create in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Compresses massive phone photos instantly
  } as any,
});

// 3. Export the Multer middleware bouncer
export const upload = multer({ storage });