import React from 'react';
import {Upload, Button, notification} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {request} from "../../services/api";
import {useTranslation} from "react-i18next";

const Index = ({ name, label, required = false,form }) => {
    const {t} = useTranslation();
    const customUpload = async ({ file, onSuccess, onError }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await request.post('api/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const fileId = res.data._id;
            onSuccess(fileId);
            notification['success']({
                message:'Успешно'
            })
        } catch (err) {
            notification['error']({
                message:err?.response?.data?.message || 'Ошибка'
            })
            onError(err);
        }
    };

    const handleChange = ({ file }) => {
        if (file.status === 'done') {
            form.setFieldValue(name, file.response);
        }
    };

    return (

            <Upload
                onChange={handleChange}
                customRequest={customUpload}
                listType="text"
                multiple={false}
            >
                <Button icon={<UploadOutlined />}>{t('Загрузить файл')}</Button>
            </Upload>
    );
};

export default Index;
