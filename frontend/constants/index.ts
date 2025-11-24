import { Platform } from "react-native";

export const API_URL = Platform.OS == 'android' ? 'http://10.0.2.2:9000' : 'http://localhost:9000';

export const CLOUDINARY_CLOUD_NAME = 'djy3ih6vf';
export const CLOUDINARY_UPLOAD_PRESET = 'images';
