import { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary';
import streamifier from 'streamifier';

export const uploadImage = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'trip-planner',
        },
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Image upload failed' });
            }
            res.json({ url: result?.secure_url });
        }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
};
