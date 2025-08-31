import React from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Spin, Tabs,
} from "antd";
import {useParams, useSearchParams} from "react-router-dom";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {KEYS} from "../../../constants/key";
import View from "../components/view";
import {get} from "lodash";
import Datagrid from "../../../containers/datagrid";
import Docs from "../components/docs";
import dayjs from "dayjs";


const AgreementViewPage = () => {
    const {id} = useParams();
    const {t} = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams()
    const {mutate, isPending} = usePostQuery({})

    let {data, isLoading, refetch} = useGetAllQuery({
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
                    onTabClick={(tab) => {
                        setSearchParams(`tab=${tab}`);
                    }}
                    activeKey={searchParams.get("tab") || 'view'}
                    items={[
                        {
                            key: 'view',
                            label: t('Мои заявления'),
                            children: <View refresh={refetch} id={id} data={get(data, 'data.result')}/>
                        },
                        {
                            key: 'docs',
                            label: t('Документы по заявлению'),
                            children: <Docs refresh={refetch} id={id} data={get(data, 'data.result')}/>
                        },
                        {
                            key: 'history',
                            label: t('История операций'),
                            children: <Datagrid responseListKeyName={'result'} showSearch={false} columns={[
                                {
                                    title: t('Дата операции'),
                                    dataIndex: 'date',
                                    render: date => dayjs(date).format('YYYY-MM-DD'),
                                },
                                {
                                    title: t('Комментарий'),
                                    dataIndex: 'comment',
                                },
                                {
                                    title: t('Типы операций'),
                                    dataIndex: 'operation',
                                    render: operation => t(operation)
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
