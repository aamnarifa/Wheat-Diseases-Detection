import { Platform } from "react-native";
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const getHostUri = (): string => {
    try {
        const hostUri = Constants.expoConfig?.hostUri;
        if (hostUri) {
            return `http://${hostUri.split(':')[0]}:8000`;
        }
    } catch(e) {}
    // Fallbacks
    if (Platform.OS === 'android') return "http://10.0.2.2:8000";
    return "http://localhost:8000";
}

export const BASE_URL = getHostUri();

console.log(`[API] Configuring BASE_URL: ${BASE_URL} (Platform: ${Platform.OS})`);

// Tokens
export const saveToken = async (token: string) => {
    if (Platform.OS === 'web') {
        localStorage.setItem('jwt_token', token);
    } else {
        await SecureStore.setItemAsync('jwt_token', token);
    }
};

export const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('jwt_token');
    } else {
        return await SecureStore.getItemAsync('jwt_token');
    }
};

export const removeToken = async () => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('jwt_token');
    } else {
        await SecureStore.deleteItemAsync('jwt_token');
    }
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await getToken();
    const headers = { ...options.headers } as any;
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, { ...options, headers });
}

export interface InsuranceScheme {
    id: number;
    name: string;
    coverage: string;
    premium_percent: number;
    eligible_diseases: string[];
}

export interface InsuranceRecommendation {
    eligible: boolean;
    severity: string;
    message?: string;
    recommended_schemes?: InsuranceScheme[];
}

export interface PredictionResult {
    success?: boolean;
    status: "success" | "rejected" | "error";
    class?: string;
    confidence?: number;
    message?: string;
    severity?: string;
    insurance?: InsuranceRecommendation;
    bbox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export const loginUser = async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    return data;
};

export const registerUser = async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    return data;
};

export const getProfile = async () => {
    const res = await fetchWithAuth(`${BASE_URL}/auth/profile`);
    const data = await res.json();
    if (!res.ok) throw new Error("Not authenticated");
    return data;
}

export const predictWheatDisease = async (uri: string): Promise<PredictionResult> => {
    console.log(`[API] Predicting disease for: ${uri}`);
    const formData = new FormData();

    if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("file", blob, "photo.jpg");
    } else {
        const filename = uri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("file", {
            uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
            name: filename,
            type,
        } as any);
    }

    try {
        const response = await fetchWithAuth(`${BASE_URL}/predict`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        return await response.json();
    } catch (error: any) {
        return {
            status: "error",
            message: `Connection failed: ${error.message}.`,
        };
    }
};

export const getWeatherAnalysis = async (latitude: number, longitude: number) => {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/weather-analysis`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
        });

        if (!response.ok) throw new Error("Weather API failed");
        return await response.json();
    } catch (error) {
        return { success: false, message: "Weather service unavailable" };
    }
};

export const getAllInsuranceSchemes = async (): Promise<InsuranceScheme[]> => {
    const response = await fetchWithAuth(`${BASE_URL}/insurance`);
    if (!response.ok) throw new Error("Failed to fetch insurance schemes");
    return await response.json();
};

export const getInsuranceRecommendation = async (disease: string): Promise<InsuranceRecommendation | null> => {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/insurance/recommend/${disease}`);
        if (!response.ok) throw new Error("Failed to fetch recommendation");
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const sendBotMessage = async (message: string, language: string = "English", context: any = null) => {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, language, context }),
        });

        if (!response.ok) throw new Error("Chat service unavailable");
        return await response.json();
    } catch (error) {
        return { success: false, message: "Trouble connecting to knowledge base." };
    }
};