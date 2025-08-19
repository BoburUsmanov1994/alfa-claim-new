import React from 'react';
import Logo from "../../components/logo";
import {Card, Flex, Layout} from "antd";
import Mode from "../../components/mode";
import FullScreen from "../../components/full-screen";
import Lang from "../../components/lang";

const {Header} = Layout;

const Index = ({children}) => {
    return (
        <Layout style={{minHeight: '100vh'}}>
            <Header style={{padding: '40px 20px'}} className={'flex items-center justify-between'}>
                <Logo classNames={'!mx-0'}/>
                <Flex align={'center'} justify={'flex-end'} gap={12}>
                    <FullScreen/>
                    <Mode/>
                    <Lang/>
                </Flex>
            </Header>
            <Card className={'mx-auto mt-[25vh] border-none'}
                  style={{width: 400, boxShadow: 'rgba(0, 0, 0, 0.06) 0px 5px 49px'}}>
                {children}
            </Card>
        </Layout>
    );
};

export default Index;
