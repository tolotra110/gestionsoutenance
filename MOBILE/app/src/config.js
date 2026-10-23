import { Platform } from "react-native";

// URL du serveur (MOBILE/backend).
//  - Version web (lien http://... ouvert dans le navigateur) : même adresse que la page -> ""
//  - Application Android / iOS : EXPO_PUBLIC_API_URL (voir eas.json ou fichier .env), sinon l'IP ci-dessous
const DEFAULT_NATIVE = "http://192.168.1.10:4000"; // <-- à remplacer par l'IP de votre ordinateur
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === "web" ? "" : DEFAULT_NATIVE);
