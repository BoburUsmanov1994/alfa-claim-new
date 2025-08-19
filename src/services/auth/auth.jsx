import React from 'react';
import { createContext, useContext } from 'react';
import {usePostQuery} from "../../hooks/api";
import {URLS} from "../../constants/url";
import {useSettingsStore} from "../../store";
import {get} from "lodash";
import {useNavigate} from "react-router-dom";

const AuthContext = createContext({
    login: () => {},
});


export function  AuthProvider  ({children})  {
    const navigate = useNavigate();
    const {token,setToken} = useSettingsStore()
    const {mutate,isPending} = usePostQuery({hideSuccessToast: true});
    const login = (_attrs) => {
        mutate({url:URLS.login,attributes:{..._attrs}},{
            onSuccess: ({data})=>{
                setToken(get(data,'access_token'));
                navigate('/claims');
            }
        });
    }
    const logout = () => {
        setToken(false);
    }
    return (
        <AuthContext.Provider value={{ token, login, logout,isLoading:isPending }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
