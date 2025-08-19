import React, {useRef} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {Button, Space, Tag} from "antd";
import {PlusOutlined, EyeOutlined, EditOutlined, FileOutlined} from "@ant-design/icons"
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useStore} from "../../../store";
import {useNavigate} from "react-router-dom";
import {get} from "lodash"

const colors = {
    draft: 'default',
    submitted: 'blue',
}

const AgreementsPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate();
    const formRef = useRef(null);
    const {user} = useStore()

    return (
        <>
            <PageHeader
                className={'p-0 mb-1.5'}
                title={t('Ваши заявления о страховом событии')}
                extra={[
                    <Button onClick={() => navigate('/claim/create')} type="primary" icon={<PlusOutlined/>}>
                        {t('Подать заявление о страховом событии')}
                    </Button>,
                ]}
            >
                <Datagrid
                    responseListKeyName={'result.docs'}
                    showSearch={false}
                    formRef={formRef}
                    defaultCollapsed
                    columns={[
                        {
                            title: t('Серия и номер полиса'),
                            dataIndex: 'polisSeria',
                            render: (text, record) => text + get(record, 'polisNumber')
                        },
                        {
                            title: t('Страховой продукт'),
                            dataIndex: 'product',
                        },
                        {
                            title: t('Страхователь'),
                            dataIndex: 'applicant',
                            render: (text) => get(text, 'person.fullName.lastname') ? `${get(text, 'person.fullName.lastname')} ${get(text, 'person.fullName.firstname')} ${get(text, 'person.fullName.middlename')}` : get(text, 'organization.name'),
                            width: 300
                        },
                        {
                            title: t('Заявитель'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Виновное лицо'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Сумма заявленного ущерба'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Статус'),
                            dataIndex: 'status',
                            render: (text) => <Tag color={colors[text] || 'default'}>{text}</Tag>,
                            align: 'center',
                        },
                        {
                            title: t('Действия'),
                            dataIndex: '_id',
                            render: (_id) => <Space>
                                <Button className={'cursor-pointer'} icon={<EyeOutlined/>}>{t('Детали')}</Button>
                                <Button onClick={() => navigate(`/claims/edit/${_id}`)} className={'cursor-pointer'}
                                        icon={<EditOutlined/>}>{t('Редактировать')}</Button>
                                <Button className={'cursor-pointer'} icon={<FileOutlined/>}>{t('Документы')}</Button>
                            </Space>
                        },
                    ]}
                    url={URLS.claimList}/>
            </PageHeader>
            <PageHeader
                className={'p-0 mt-6'}
                title={t('Заявления, поступившие по Вашим страховым полисам')}
            >
                <Datagrid
                    showSearch={false}
                    formRef={formRef}
                    defaultCollapsed
                    columns={[
                        {
                            title: t('Серия и номер полиса'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Страховой продукт'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Страхователь'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Заявитель'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Виновное лицо'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Сумма заявленного ущерба'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Статус'),
                            dataIndex: 'agreementNumber',
                        },
                    ]}
                    url={URLS.claimList}/>
            </PageHeader>
        </>
    );
};

export default AgreementsPage;
