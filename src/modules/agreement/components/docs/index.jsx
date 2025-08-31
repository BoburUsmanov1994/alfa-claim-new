import React from 'react';
import {Button, Col, Form, Input, Row, Space, Spin, Table, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {DeleteOutlined, EyeOutlined} from "@ant-design/icons";
import {get} from "lodash"
import dayjs from "dayjs";
import CustomUpload from "../../../../components/custom-upload";
import {usePutQuery} from "../../../../hooks/api";
import {URLS} from "../../../../constants/url";
import {isNil} from "lodash/lang";

const Index = ({
                   data,
                   refresh = () => {
                   },
               }) => {
    const {t} = useTranslation();
    const {mutate, isPending} = usePutQuery({})
    return (
        <Spin spinning={isPending}>
            <Form className={'mt-4'}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item layout={'horizontal'}
                                   label={t('Заявление о страховом событии')}>
                            <Input value={get(data, 'documents.claimStatement.url')} disabled suffix={
                                get(data, 'documents.claimStatement.url') ?
                                    <Button href={get(data, 'documents.claimStatement.url')}
                                            icon={<EyeOutlined/>} type="link"/> : null
                            }/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item>
                            <Table
                                scroll={{x: 1200}}
                                dataSource={get(data, 'documents.materials', [])}
                                title={() => <Space className={'flex justify-between'} block
                                                    align={'center'}><Typography.Title
                                    level={5}>{t('Материалы по претензионному делу')}</Typography.Title></Space>}
                                columns={
                                    [
                                        {
                                            title: t('Дата запроса'),
                                            dataIndex: 'requestDate',
                                            render: (text) => dayjs(text).format('YYYY-MM-DD'),
                                            align: 'center',
                                        },
                                        {
                                            title: t('Описание документа'),
                                            dataIndex: 'description',
                                            align: 'center',
                                        },
                                        {
                                            title: t('Шаблон'),
                                            dataIndex: 'template',
                                            align: 'center',
                                            render: (text, record) => <Button icon={<EyeOutlined/>} type={'link'}
                                                                              href={get(text, 'url')}/>,
                                        },
                                        {
                                            title: t('Кем запрошено'),
                                            dataIndex: 'whoRequested',
                                            align: 'center',
                                        },
                                        {
                                            title: t('Дата предоставления'),
                                            dataIndex: 'requestDate',
                                            render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '',
                                        },
                                        {
                                            title: t('Файл'),
                                            dataIndex: 'file',
                                            align: 'center',
                                            render: (text, record) => get(text, 'url') ?
                                                <Space><Button icon={<EyeOutlined/>} type={'link'}
                                                               href={get(text, 'url')}/>
                                                    <Button onClick={() => {
                                                        mutate({
                                                            url: URLS.claimDocsDetach,
                                                            attributes: {
                                                                claimNumber: parseInt(get(data, 'claimNumber')),
                                                                materialId: get(record, 'id')
                                                            }
                                                        }, {
                                                            onSuccess: () => {
                                                                refresh()
                                                            }
                                                        })
                                                    }} type={'dashed'} danger
                                                            icon={
                                                                <DeleteOutlined/>}>{t('Удалить файл')}</Button>
                                                </Space> : <CustomUpload
                                                    setFile={(_file) => {
                                                        mutate({
                                                            url: URLS.claimDocsAttach,
                                                            attributes: {
                                                                id: get(data, '_id'),
                                                                materials: [{
                                                                    id: get(record, 'id'),
                                                                    provideDate: dayjs(),
                                                                    file: {
                                                                        file: get(_file, 'result.id'),
                                                                        url: get(_file, 'result.url')
                                                                    }
                                                                }]
                                                            }
                                                        }, {
                                                            onSuccess: () => {
                                                                refresh()
                                                            }
                                                        })
                                                    }}

                                                />
                                        },
                                        {
                                            title: t('Дата проверки'),
                                            dataIndex: 'checkDate',
                                            align: 'center',
                                            render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '',
                                        },
                                        {
                                            title: t('Кем проверено'),
                                            dataIndex: 'whoChecked',
                                            align: 'center',
                                        },
                                        {
                                            title: t('Результат проверки'),
                                            dataIndex: 'checkResult',
                                            align: 'center',
                                            render: (text) => isNil(text) ? 'Не проверено' : text ? 'принят' : 'не принят'
                                        },
                                        {
                                            title: t('Комментарий'),
                                            dataIndex: 'comment',
                                            align: 'center',
                                        },
                                    ]
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item layout={'horizontal'}
                                   label={t('Акт о страховом случае')}>
                            <Input value={get(data, 'documents.claimAct.url')} disabled
                                   suffix={
                                       get(data, 'documents.claimAct.url') ?
                                           <Button href={get(data, 'documents.claimAct.url')}
                                                   icon={<EyeOutlined/>} type="link"/> : null
                                   }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item layout={'horizontal'}
                                   label={t('Платежные документы')}>
                            <Input value={get(data, 'documents.paymentDocs.url')} disabled
                                   suffix={
                                       get(data, 'documents.paymentDocs.url') ?
                                           <Button href={get(data, 'documents.paymentDocs.url')}
                                                   icon={<EyeOutlined/>} type="link"/> : null
                                   }
                            />
                        </Form.Item>
                    </Col>

                </Row>
            </Form>
        </Spin>
    );
};

export default Index;
