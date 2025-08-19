import React, {useEffect} from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FileOutlined,
} from '@ant-design/icons';
import {Button, Flex, Layout, Menu, Modal, Spin, theme, Tooltip} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import Logo from "../../components/logo";
import AlfaSvg from './../../assets/images/alfa.svg'
import Mode from "../../components/mode";
import {useSettingsStore, useStore} from "../../store";
import {KEYS} from "../../constants/key";
import {URLS} from "../../constants/url";
import {isNil} from "lodash/lang";
import {useGetAllQuery} from "../../hooks/api";
import {get} from "lodash";
import FullScreen from "../../components/full-screen";
import {useTranslation} from "react-i18next";
import {LogoutOutlined, UserOutlined, ExclamationCircleOutlined} from "@ant-design/icons"
import Lang from "../../components/lang";
import i18n from './../../services/i18n';

const {Header, Sider, Content} = Layout;


function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label: i18n.t(label)
    };
}

const items = [
    getItem('Журнал заявлений', '/claims', <FileOutlined/>),

];


const Index = ({children}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {t} = useTranslation()
    const {collapsed, toggleCollapsed, token} = useSettingsStore()
    const {setUser, user} = useStore()
    const [modal, contextHolder] = Modal.useModal();

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const {data, isLoading} = useGetAllQuery({
        key: KEYS.getMe,
        url: URLS.getMe,
        hideErrorMsg: true,
        params: {},
        enabled: !isNil(token),
    })

    const confirm = () => {
        modal.confirm({
            title: t('Вы уверены, что хотите выйти?'),
            icon: <ExclamationCircleOutlined/>,
            okText: t('Да'),
            cancelText: t('Нет'),
            onOk() {
                localStorage.clear()
                window.location.reload()
            }
        });
    };
    useEffect(() => {
        if (data) {
            setUser(get(data, 'data.result'))
        }
    }, [data]);

    if (isLoading) {
        return <Spin fullscreen spinning={isLoading}/>
    }

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider style={{
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start',
                height: '100vh',
                overflowY: 'auto'
            }} trigger={null} collapsible collapsed={collapsed} width={225}>
                <Logo classNames={'mb-6'}/>
                <Menu onClick={({key}) => navigate(key)} theme="dark" defaultSelectedKeys={[location?.pathname]}
                      mode="inline" items={items}/>
                <img className={'absolute bottom-0 right-0 -z-10'} src={AlfaSvg} alt="alfa"/>
            </Sider>
            <Layout>
                <Header className={'justify-between w-full flex p-0 pr-6 items-center'}
                        style={{background: colorBgContainer}}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={() => toggleCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Flex align={'center'} gap={12}>
                        {user && <Button type={'link'} icon={<UserOutlined/>} className={'font-medium'}>
                            {get(user, 'name')}
                        </Button>}
                        <FullScreen/>
                        <Mode/>
                        <Lang/>
                        <Tooltip title={t('Выйти')}>
                            <Button className={'mt-1.5'} size={'large'} onClick={confirm} type={'link'} danger
                                    icon={<LogoutOutlined style={{fontSize: '24px'}}/>}
                            />
                        </Tooltip>
                    </Flex>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 12,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                    {contextHolder}
                </Content>
            </Layout>
        </Layout>
    );
};
export default Index;
