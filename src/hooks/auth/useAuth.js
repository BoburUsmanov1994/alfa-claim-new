import {get} from "lodash";
import {useSettingsStore, useStore} from "../../store";

const useAuth = () => {
    const user = useStore(state => get(state, 'user', null))
    const isAuthenticated = useStore(state => get(state, 'isAuthenticated', false))
    const token = useSettingsStore(state => get(state, 'token', null))
    return {
        user,
        isAuthenticated,
        token
    }
};

export default useAuth;
