import React from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Spin, Tabs,
} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {KEYS} from "../../../constants/key";
import useAuth from "../../../hooks/auth/useAuth";
import View from "../components/view";
import {get} from "lodash";
import Datagrid from "../../../containers/datagrid";


const AgreementViewPage = () => {
    const {id} = useParams();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {user} = useAuth()
    const {mutate, isPending} = usePostQuery({})

    let {data, isLoading} = useGetAllQuery({
        key: [KEYS.claimShow, id],
        url: `${URLS.claimShow}?id=${id}`,
        enabled: !!(id)
    });


    if (isLoading) {
        return <Spin spinning fullscreen/>
    }

    return (
        <>
            <PageHeader
                title={t('Детали заявления')}
            >

                <Tabs
                    items={[
                        {
                            key: 'view',
                            label: t('Мои заявления'),
                            children: <View id={id} data={get(data, 'data.result')}/>
                        },
                        {
                            key: 'docs',
                            label: t('Документы по заявлению')
                        },
                        {
                            key: 'history',
                            label: t('История операций'),
                            children: <Datagrid responseListKeyName={'result'} showSearch={false} columns={[
                                {
                                    title: t('Дата операции'),
                                    dataIndex: 'date',
                                },
                                {
                                    title: t('Комментарий'),
                                    dataIndex: 'comment',
                                },
                                {
                                    title: t('Типы операций'),
                                    dataIndex: 'operation',
                                }
                            ]} url={`${URLS.claimHistory}?id=${id}`}/>
                        }
                    ]}
                />
            </PageHeader>

        </>

    );
};

export default AgreementViewPage;
