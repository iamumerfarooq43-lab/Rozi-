
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const cloudinaryConfigured = Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    CLOUDINARY_API_KEY !== 'your_api_key' &&
    CLOUDINARY_API_SECRET !== 'your_api_secret'
);

const uploadMiddleware = cloudinaryConfigured
    ? multer({
        storage: new CloudinaryStorage({
            cloudinary,
            params: {
                folder: 'rozi/avatars',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [{ width: 300, height: 300, crop: 'fill' }],
            },
        }),
    })
    : {
        single: () => (req, res) => {
            res.status(500).json({
                message:
                    'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your backend .env file.',
            });
        },
    };

if (cloudinaryConfigured) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
} else {
    console.warn(
        'Cloudinary is not configured. Avatar uploads will be disabled until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set correctly.'
    );
}

export const upload = uploadMiddleware;
export default cloudinary;