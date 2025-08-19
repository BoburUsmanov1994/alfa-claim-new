import React from 'react';
import {ConfigProvider, theme as antdTheme} from "antd";
import ruRu from "antd/locale/ru_RU";
import Query from "./services/query";
import Router from "./router";
import 'antd/dist/reset.css';
import './index.css';
import {useSettingsStore} from "./store";

const App = () => {
    const {darkMode} = useSettingsStore()
    return (
        <>
            <ConfigProvider locale={ruRu} theme={{algorithm:darkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,token:{
                        colorPrimary: darkMode ? '#13D6D1' : '#13D6D1',
                        colorBgBase: darkMode ? '#1D283A' : '#ffffff',
                        colorText: darkMode ? '#e0e0e0' : '#000000',
                        fontFamily: 'Gilroy-Regular, sans-serif',
                    },components:{
                    Segmented: {
                        itemSelectedBg: '#13d6d1',
                        itemSelectedColor: '#fff',
                    },
                }}}>
                <Query>
                    <Router/>
                </Query>
            </ConfigProvider>
        </>
    );
};

export default App;
