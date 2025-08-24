import React, {useState} from 'react';
import {Button, Card, Col, Drawer, notification, Row, Table, Upload} from "antd";
import {DeleteOutlined, InboxOutlined, PlusOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {request} from "../../../../services/api";
import {URLS} from "../../../../constants/url";
import {get} from "lodash";
import {useDeleteQuery, usePostQuery} from "../../../../hooks/api";

const {Dragger} = Upload;

const Index = ({
                   files = [],
                   setFiles = () => {
                   },
               }) => {
    const {mutate, isPending} = usePostQuery({})
    const {mutate: deleteRequest, isPending: isPendingDelete} = useDeleteQuery({})
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);

    const customUpload = async ({file, onSuccess, onError}) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await request.post('api/file', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });

            const _file = res?.data?.result;
            onSuccess(_file);
            notification['success']({
                message: 'Успешно'
            })
        } catch (err) {
            notification['error']({
                message: err?.response?.data?.message || 'Ошибка'
            })
            onError(err);
        }
    };

    const handleChange = ({file}) => {
        if (file.status === 'done') {
            setFiles(prev => [...prev, file.response]);
            setOpen(false);
        }
    };
    const removeFile = (_file) => {
        setFiles(prev => prev.filter(item => item._id !== _file._id));
        deleteRequest({url: `${URLS.file}/${get(_file, '_id')}`}, {
            onSuccess: () => {

            }
        })
    }
    return (
        <>
            <Card title={t('Подтверждающие фото- и видео-материалы:')} bordered
                  extra={[<Button icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                      {t('Добавить файл')}
                  </Button>]}>
                <Row gutter={16} align="middle">
                    <Col span={24}>
                        <Table
                            loading={isPendingDelete}
                            dataSource={files}
                            columns={[
                                {
                                    title: t('ID'),
                                    dataIndex: 'id',
                                    render: (value,record)=>get(record, 'id',get(record, 'file')),
                                },
                                {
                                    title: t('URL-адрес файла'),
                                    dataIndex: 'url',
                                    align: 'center',
                                    render: (text)=><Button href={text} type={'link'}>{text}</Button>
                                },
                                {
                                    title: t('Действия'),
                                    dataIndex: '_id',
                                    align: 'center',
                                    render: (text, record) => <Button onClick={() => removeFile(record)} danger
                                                                       icon={<DeleteOutlined/>}/>
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
            <Drawer title={t('Добавить файл')} open={open} onClose={() => setOpen(false)}>

                <div className={'h-60'}>
                    <Dragger
                        showUploadList={false}
                        name={'file'}
                        multiple={false}
                        onChange={handleChange}
                        customRequest={customUpload}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">{t('Щелкните или перетащите файл в эту область для загрузки.')}</p>

                    </Dragger>
                </div>
            </Drawer>
        </>
    );
};

export default Index;
