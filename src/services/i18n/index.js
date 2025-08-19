import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {resource} from "../locales";

i18n.use(initReactI18next).init({
    resources:resource,
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
