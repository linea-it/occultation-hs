import { useState, createContext, useEffect } from "react";
import UserService from "../services/userService";

export const AuthContext = createContext({});

const _USER_KEY_ = 'SoraInfoUser';
function getUserInfo() {
    let user = localStorage.getItem(_USER_KEY_);
    let storage = localStorage;
    if (!user) {
        user = sessionStorage.getItem(_USER_KEY_);
        storage = sessionStorage;
    }
    if (user) {
        user = JSON.parse(user);
    }
    return { user, storage };
}

export function accessToken() {
    const { user } = getUserInfo();
    return (user || {}).accessToken;
}

export function refreshToken() {
    const { user } = getUserInfo();
    return (user || {}).refreshToken;
}

export default function AuthProvider({ children }) {
    const userService = new UserService();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        function loadStorage() {
            const { user } = getUserInfo();
            if (user) {
                userService.userVerify(user.email).then(() => {
                    setUser(user);
                }).catch(() => {
                  signOut();
                }).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        }
        setLoading(true);
        loadStorage();
    }, [])

    function setUserInfo(data, storage) {
        setUser(data);
        storage.setItem(_USER_KEY_, JSON.stringify(data));
    }

    function signOut() {
        sessionStorage.removeItem(_USER_KEY_);
        localStorage.removeItem(_USER_KEY_);
        setUser(null);
    }

    function signIn(email, password, remember) {
        return userService.login(email, password).then(response => {
            const data = response.data;
            let info = {
                nome: data.nome,
                email: data.email,
                emailVerified: data['email-verified'],
                accessToken: data['access-token'],
                refreshToken: data['refresh-token'],
            }
            const storage = remember ? localStorage : sessionStorage;
            setUserInfo(info, storage);
            return true;
        }).catch(() => {
            return false
        });
    }

    function verifyEmail(token) {
        return userService.validateEmail(
            token
        ).then((resp) => {
            if (resp.data.status === "error") {
                throw resp.data.message;
            }
            const { user, storage } = getUserInfo();
            user.emailVerified = true;
            setUserInfo(user, storage);
        })
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signOut, signIn, verifyEmail }}>
            {children}
        </AuthContext.Provider>
    )
}