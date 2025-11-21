import { Platform } from "react-native";

export const API_URL = Platform.OS == 'android' ? 'http://192.168.1.3:9000' : 'http://localhost:9000';
