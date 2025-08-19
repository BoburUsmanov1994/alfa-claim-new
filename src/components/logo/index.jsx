import React from 'react';
import logo from "../../assets/images/logo.svg"
import miniLogo from "../../assets/images/mini-logo.svg"
import {Link} from "react-router-dom";
import {useSettingsStore} from "../../store";
import clsx from "clsx";
const Index = ({classNames=''}) => {
    const {collapsed} = useSettingsStore()
    return (
        <Link to={'/'} className={clsx('mt-4 mb-3 mx-auto flex justify-center',classNames)}>
            <img src={collapsed ? miniLogo : logo} alt={'logo'} width={collapsed ? 40 : 185}/>
        </Link>
    );
};

export default Index;
