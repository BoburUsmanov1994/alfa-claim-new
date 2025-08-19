import React from 'react';
import {Segmented} from "antd";
import {useSettingsStore} from "../../store";
import {MoonOutlined,SunOutlined} from '@ant-design/icons'

const Index = () => {
    const {toggleDarkMode,darkMode} = useSettingsStore()
    return (
        <>
            <Segmented
                defaultValue={darkMode}
                size={'middle'}
                shape="round"
                options={[
                    { value: false, icon: <SunOutlined /> },
                    { value: true, icon: <MoonOutlined /> },
                ]}
                onChange={toggleDarkMode}
            />
        </>
    );
};

export default Index;
