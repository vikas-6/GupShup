import { login, register } from "@/services/authService";
import { connectSocket, disconnectSocket } from "@/socket/socket";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";


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

export const AuthContext = createContext<AuthContextProps>({
    token: null,
    user: null,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [ token, setToken ] = useState<string | null>(null);
    const [ user, setUser ] = useState<UserProps | null>(null);

    useEffect(() => {
        const loadToken = async () => {
            const storedToken = await AsyncStorage.getItem("token");
            if (storedToken) {
                try {
                    const decoded = jwtDecode<DecodedTokenProps>(storedToken);
                    if(decoded.exp && decoded.exp < Date.now() / 1000){
                        // token has expired, navigate to welcome page
                        await AsyncStorage.removeItem("token");
                        gotoWelcomePage();
                        return;
                    }

                    // user is logged in
                    setToken(storedToken);
                    await connectSocket();
                    setUser(decoded.user);
                    gotoHomePage();

                } catch (error) {
                    gotoWelcomePage();
                    console.log('Failed to decode the token', error);
                }
            } else {
                gotoWelcomePage();
            }
        }
        loadToken();
    }, []);

    const updateToken = async (newToken: string) => {
        setToken(newToken);
        await AsyncStorage.setItem("token", newToken);
        
        // decode token
        const decoded = jwtDecode<DecodedTokenProps>(newToken);
        console.log('decoded token:', decoded);
        setUser(decoded.user);
    };

    const signIn = async (email: string, password: string) => {
        const response = await login(email, password);
        await updateToken(response.token);
        await connectSocket();
        router.replace("/(main)/Home");
    };

    const signUp = async (email: string, password: string, name: string, avatar?: string | null) => {
        const response = await register(email, password, name, avatar);
        await updateToken(response.token);
        await connectSocket();
        router.replace("/(main)/Home");
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem("token");
        await disconnectSocket();
        router.replace("/(auth)/welcome");
    };

    return (
        <AuthContext.Provider value={{token, user, signIn, signUp, signOut, updateToken}}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);