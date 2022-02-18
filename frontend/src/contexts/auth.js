import { useState, createContext, useEffect } from "react";
import UserService from "../services/userService";

export const AuthContext = createContext({});

function getUserInfo() {
    const strUser = localStorage.getItem('InfoUser');
    return !strUser?undefined: JSON.parse(strUser);
}

export function accessToken()
{
    const user = getUserInfo();
    return user?.accessToken;
}

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        function loadStorage() {
            const storageUser = localStorage.getItem('InfoUser');

            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }

            setLoading(false);
        }

        loadStorage();
    }, [])

    function isAuthenticated()
    {
        const user = getUserInfo();
        return user !== null && !!user.accessToken;
    }

    function refreshToken()
    {
        const user = getUserInfo();
        return user?.refreshToken;
    }

    async function signUp(email, userName, confirmPassword, password) {
        setLoadingAuth(true);
        const userService = new UserService();
        userService.create(
            {
                "username": userName,
                "email": email,
                "password": password,
                "confirm_password": confirmPassword
            }
        ).then((result) => {

            let data = {
                nome: userName,
                email: email
            }

            setUser(data);
            storageUser(data);
            setLoadingAuth(false);      
        }).catch(() => {
            setLoadingAuth(false);   
        });
    }

    function storageUser(data){
        localStorage.setItem('InfoUser', JSON.stringify(data));
    }

    async function signOut(){
        localStorage.removeItem('InfoUser');
        setUser(null);
    }

    async function signIn(email, password){
        setLoadingAuth(true);
        const userService = new UserService();
        userService.login(email, password).then((response) => {
            const data = response.data;
            console.log(data);
            let info = {
                nome: data.nome,
                email: data.email,
                accessToken: data['access-token'],
                refreshToken: data['refresh-token'],
            }
            setUser(info);
            storageUser(info);
            setLoadingAuth(false);  
        }).catch(() => {
            setLoadingAuth(false);  
        });      
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signUp, signOut, signIn, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;