import React, {useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {Button, Drawer, Space, Table, Tag} from "antd";
import {PlusOutlined, EyeOutlined, EditOutlined, FileOutlined} from "@ant-design/icons"
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useNavigate} from "react-router-dom";
import {get, isEqual} from "lodash"
import {isNil} from "lodash/lang";
import {CLAIM_STATUS_LIST} from "../../../constants";
import Docs from "../components/docs";
import numeral from "numeral";


const AgreementsPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [record, setRecord] = useState(null)

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
                    actionRef={formRef}
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
                            render: (text) => get(text, 'name'),
                            width: 200,
                        },
                        {
                            title: t('Страхователь'),
                            dataIndex: 'insurantInfo',
                            width: 200,
                            render: (text) => get(text, 'organization.name', `${get(text, 'person.fullName.lastname', '-')} ${get(text, 'person.fullName.firstname', '-')} ${get(text, 'person.fullName.middlename', '-')}`),
                        },
                        {
                            title: t('Заявитель'),
                            dataIndex: 'applicant',
                            render: (text) => get(text, 'person.fullName.lastname') ? `${get(text, 'person.fullName.lastname')} ${get(text, 'person.fullName.firstname')} ${get(text, 'person.fullName.middlename')}` : get(text, 'organization.name'),
                            width: 225
                        },
                        {
                            title: t('Виновное лицо'),
                            dataIndex: 'responsibleForDamage',
                            width: 225,
                            render: (text) => get(text, 'person.fullName.lastname') ? `${get(text, 'person.fullName.lastname')} ${get(text, 'person.fullName.firstname')} ${get(text, 'person.fullName.middlename')}` : get(text, 'organization.name'),
                        },
                        {
                            title: t('Сумма заявленного ущерба'),
                            dataIndex: 'totalDamageSum',
                            align: 'center',
                            render: (text) => numeral(text).format('0,0.00')
                        },
                        {
                            title: t('Статус'),
                            dataIndex: 'status',
                            render: (text) => <Tag color={CLAIM_STATUS_LIST[text] || 'default'}>{t(text)}</Tag>,
                            align: 'center',
                        },
                        {
                            title: t('Действия'),
                            dataIndex: '_id',
                            fixed: 'right',
                            width: 125,
                            render: (_id, _record) => <Space>
                                {!isEqual(get(_record, 'status'), 'draft') &&
                                    <Button onClick={() => navigate(`/claims/view/${_id}`)} className={'cursor-pointer'}
                                            icon={<EyeOutlined/>}/>}
                                {isEqual(get(_record, 'status'), 'draft') &&
                                    <Button onClick={() => navigate(`/claims/edit/${_id}`)} className={'cursor-pointer'}
                                            icon={<EditOutlined/>}/>}
                                <Button onClick={() => setRecord(_record)} className={'cursor-pointer'}
                                        icon={<FileOutlined/>}/>
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
                            align: 'center',
                        },
                        {
                            title: t('Статус'),
                            dataIndex: 'agreementNumber',
                        },
                        {
                            title: t('Действия'),
                            dataIndex: '_id',
                            fixed: 'right',
                            width: 100,
                            render: (_id, _record) => <Space>
                                <Button onClick={() => navigate(`/claims/view/${_id}`)} className={'cursor-pointer'}
                                        icon={<EyeOutlined/>}/>
                            </Space>
                        }
                    ]}
                    url={URLS.claimExternalList}/>
            </PageHeader>
            <Drawer width={1200} title={t('Документы')} open={!isNil(record)} onClose={() => setRecord(null)}>
                <Docs data={record} refresh={() => {
                    formRef.current?.reload();
                    setRecord(null);
                }}/>
            </Drawer>
        </>
    );
};

export default AgreementsPage;
