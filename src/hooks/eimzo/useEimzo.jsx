import {ReactEIMZO} from "../../services/e-imzo";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {notification} from "antd";

const useEimzo = (enabled = true) => {
    const {t} = useTranslation();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)
    const [signed, setSigned] = useState(null)
    const [signedError, setSignedError] = useState(null)

    useEffect(() => {
        if(enabled){
            initEIMZO();
        }
    }, [])

    const sign = async (key,content,handleSigned) => {
        setSignedError(null);
        setSigned(null);

        if(key){
            try {
                let res = await ReactEIMZO.signPkcs7(key, content);

                setLoading(true);
                setSigned(res)
                handleSigned(res,null);
                return res;
            } catch (e) {
                setSignedError("PASSWORD_INCORRECT");
                handleSigned(null,"PASSWORD_INCORRECT");
                setLoading(false);
                notification['error']({
                    message: 'Пароль неверный'
                })
                return null;
            }
        }else{
            setSignedError("PASSWORD_INCORRECT");
            handleSigned(null,"PASSWORD_INCORRECT");
            setLoading(false);
            notification['error']({
                message: 'У вас нет ключа'
            })

            return null;
        }
    }
    const initEIMZO = async () => {
        setLoading(true);
        setError(null);
        setKeys([]);
        try {
            await ReactEIMZO.install();
            try {
                const allKeys = await ReactEIMZO.listAllUserKeys();
                await setKeys(allKeys);
                setLoading(false);
            } catch (e) {
                setError('KEY_NOT_FOUND')
                setLoading(false);

            }
        } catch (e) {
            setError('NOT_INSTALLED');
            setLoading(false);
        }
    }
    return {keys,loading,error,sign,signed,signedError,initEIMZO};
}
export default useEimzo;
