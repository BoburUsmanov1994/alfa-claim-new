import React from 'react';
import {Select, Space} from "antd";
import ruImg from "../../assets/images/ru.svg"
import uzImg from "../../assets/images/uz.svg"
import enImg from "../../assets/images/en.png"
import {useSettingsStore} from "../../store";

const {Option} = Select

const langs = [
    {
        value: 'ru',
        label: 'Ру',
        icon: ruImg
    },
    {
        value: 'uz',
        label: 'Uz',
        icon: uzImg
    },
    {
        value: 'kr',
        label: 'Ўз',
        icon: uzImg
    },
    {
        value: 'en',
        label: 'En',
        icon: enImg
    }
]
const Index = () => {
    const {lang,setLang} = useSettingsStore()
    return (
        <>
            <Select
               value={lang}
               onChange={setLang}
                className="language-select"
            >
                {langs.map(({value, label, icon}) => (
                    <Option key={value} value={value} label={
                        <span className="option-label inline-flex flex-row">
            <span className="flag-icon">{icon}</span>
            <span>{label}</span>
          </span>
                    }>
          <span className="option-label inline-flex items-center">
            <span className="flag-icon flex-none"><img width={18} height={18} src={icon} alt={label}/></span>
            <span>{label}</span>
          </span>
                    </Option>
                ))}
            </Select>
        </>
    );
};

export default Index;
