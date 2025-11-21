import { login, register } from "@/services/authService";
import { AuthContextProps, DecodedTokenProps } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

const gotoHomePage = () => {
    // wait for 1.5 seconds so only for showing splash screen
    setTimeout(() => {
        router.replace("/(main)/Home");
    }, 1500);
}

const gotoWelcomePage = () => {
    // wait for 1.5 seconds so only for showing splash screen
    setTimeout(() => {
        router.replace("/(auth)/welcome");
    }, 1500);
}

const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
        try {
            const decoded = jwtDecode<DecodedTokenProps>(storedToken);
            if(decoded.exp && decoded.exp < Date.now() / 1000){
                await AsyncStorage.removeItem("token");
                return null;
            }

            return { token: storedToken, user: decoded.user };
        } catch (error) {
            console.log('Failed to decode the token', error);
            return null;
        }
    } else {
        return null;
    }
}

export const AuthContext = createContext<AuthContextProps>({
    token: null,
    user: null,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [ token, setToken ] = useState<string | null>(null);
    const [ user, setUser ] = useState<AuthContextProps['user']>(null);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const result = await loadToken();
            if (result) {
                setToken(result.token);
                setUser(result.user);
                gotoHomePage();
            } else {
                gotoWelcomePage();
            }
        };
        initializeAuth();
    }, []);

    const updateToken = async (Token: string) => {
        if (Token) {
            setToken(Token);
            await AsyncStorage.setItem("token", Token);
            
            // decode token
            const decoded = jwtDecode<DecodedTokenProps>(Token);
            console.log('decoded token:', decoded);
            setUser(decoded.user);
        }
    };

    const signIn = async (email: string, password: string) => {
        const response = await login(email, password);
        await updateToken(response.token);
        router.push("/(main)/Home");
    };

    const signUp = async (email: string, password: string, name: string, avatar?: string | null) => {
        const response = await register(email, password, name, avatar);
        await updateToken(response.token);
        router.push("/(main)/Home");
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem("token");
        router.push("/(auth)/welcome");
    };

    return (
        <AuthContext.Provider value={{token, user, signIn, signUp, signOut, updateToken}}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);