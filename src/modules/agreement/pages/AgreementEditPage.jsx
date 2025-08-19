import React, {useEffect, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Input, notification,
    Radio,
    Row,
    Select,
    Spin, Table,
    Typography,
    Upload
} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import MaskedInput from "../../../components/masked-input";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {get, isEmpty, isEqual, toUpper} from "lodash";
import dayjs from "dayjs";
import {PlusOutlined, ReloadOutlined, InboxOutlined, DeleteOutlined} from "@ant-design/icons";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import useAuth from "../../../hooks/auth/useAuth";
import {request} from "../../../services/api";

const {Dragger} = Upload;

const AgreementEditPage = () => {
    const {id} = useParams();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const {user} = useAuth()
    const {mutate, isPending} = usePutQuery({})
    const {mutate: deleteRequest, isPending: isPendingDelete} = useDeleteQuery({})
    const {applicant, client, eventCircumstances} = Form.useWatch([], form) || {}
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState([]);
    let {data, isLoading} = useGetAllQuery({
        key: [KEYS.claimShow, id],
        url: `${URLS.claimShow}?id=${id}`,
        enabled: !!(id)
    });

    let {data: residentTypes, isLoading: isLoadingResident} = useGetAllQuery({
        key: KEYS.residentType,
        url: URLS.residentType,
    });
    residentTypes = getSelectOptionsListFromData(get(residentTypes, `data.result`, []), 'id', 'name')

    const {data: country, isLoading: isLoadingCountry} = useGetAllQuery({
        key: KEYS.countries, url: `${URLS.countries}`
    })
    const countryList = getSelectOptionsListFromData(get(country, `data.result`, []), 'id', 'name')

    let {data: regions, isLoading: isLoadingRegion} = useGetAllQuery({
        key: KEYS.regions,
        url: URLS.regions,
    });
    regions = getSelectOptionsListFromData(get(regions, `data.result`, []), 'id', 'name')
    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(applicant, 'person.regionId'), get(applicant, 'organization.regionId'), get(eventCircumstances, 'regionId')],
        url: URLS.districts,
        params: {
            params: {
                region: get(applicant, 'person.regionId') || get(applicant, 'organization.regionId') || get(eventCircumstances, 'regionId')
            }
        },
        enabled: !!(get(applicant, 'person.regionId') || get(applicant, 'organization.regionId') || get(eventCircumstances, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.result`, []), 'id', 'name')

    let {data: ownershipForms, isLoading: isLoadingOwnershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms,
        url: URLS.ownershipForms,
    });
    ownershipForms = getSelectOptionsListFromData(get(ownershipForms, `data.result`, []), 'id', 'name')

    const getPersonInfo = () => {
        mutate({
            url: URLS.personalInfo,
            attributes: {
                passportSeries: toUpper(form.getFieldValue(['applicant', 'person', 'passportData', 'seria'])),
                passportNumber: form.getFieldValue(['applicant', 'person', 'passportData', 'number']),
                pinfl: form.getFieldValue(['applicant', 'person', 'passportData', 'pinfl']),
            }
        }, {
            onSuccess: ({data: {result} = {}}) => {
                form.setFieldValue(['applicant', 'person', 'birthDate'], dayjs(get(result, 'birthDate')))
                form.setFieldValue(['applicant', 'person', 'fullName', 'firstname'], get(result, 'firstNameLatin'))
                form.setFieldValue(['applicant', 'person', 'fullName', 'lastname'], get(result, 'lastNameLatin'))
                form.setFieldValue(['applicant', 'person', 'fullName', 'middlename'], get(result, 'middleNameLatin'))
                form.setFieldValue(['applicant', 'person', 'gender'], get(result, 'gender'))
                form.setFieldValue(['applicant', 'person', 'regionId'], get(result, 'regionId'))
                form.setFieldValue(['applicant', 'person', 'districtId'], get(result, 'districtId'))
                form.setFieldValue(['applicant', 'person', 'address'], get(result, 'address'))
            }
        })
    }

    const getOrgInfo = () => {
        mutate({
            url: URLS.orgInfo,
            attributes: {
                inn: form.getFieldValue(['applicant', 'organization', 'inn']),
            }
        }, {
            onSuccess: ({data: {result} = {}}) => {
                form.setFieldValue(['applicant', 'organization', 'name'], get(result, 'name'))
                form.setFieldValue(['applicant', 'organization', 'oked'], get(result, 'oked'))
                form.setFieldValue(['applicant', 'organization', 'address'], get(result, 'address'))
                form.setFieldValue(['applicant', 'organization', 'checkingAccount'], get(result, 'account'))
                form.setFieldValue(['applicant', 'organization', 'representativeName'], get(result, 'gdFullName'))
                form.setFieldValue(['applicant', 'organization', 'phone'], get(result, 'phone'))
                form.setFieldValue(['applicant', 'organization', 'email'], get(result, 'email'))
            }
        })
    }
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

    const onFinish = ({client, eventCircumstances, ...rest}) => {
        mutate({
            url: URLS.claimEdit,
            attributes: {
                id,
                ...rest,
                eventCircumstances: {
                    ...eventCircumstances,
                    countryId: String(get(eventCircumstances, 'countryId'))
                },
                photoVideoMaterials: files?.map(({_id, url}) => ({file: _id, url}))
            }
        }, {
            onSuccess: () => {
                form.resetFields();
                navigate('/agreements')
            }
        })
    };
    useEffect(() => {
        if (!isEmpty(get(data, 'data.result.photoVideoMaterials', []))) {
            setFiles(get(data, 'data.result.photoVideoMaterials', []))
        }
    }, [data])

    if (isLoading || isLoadingCountry || isLoadingResident || isLoadingRegion || isLoadingOwnershipForms) {
        return <Spin spinning fullscreen/>
    }

    return (
        <>
            <PageHeader
                title={t('Редактировать заявление')}
            />
            <Spin spinning={isPending}>
                <Form
                    name="claim"
                    form={form}
                    layout="vertical"
                    initialValues={{
                        client: get(data, 'data.result.applicant.person') ? 'person' : 'organization',
                        ...get(data, 'data.result'),
                        applicant: {
                            ...get(data, 'data.result.applicant'),
                            person: {
                                ...get(data, 'data.result.applicant.person'),
                                birthDate: dayjs(get(data, 'data.result.applicant.person.birthDate')),
                            },
                        },
                        eventCircumstances: {
                            ...get(data, 'data.result.eventCircumstances'),
                            eventDateTime: dayjs(get(data, 'data.result.eventCircumstances.eventDateTime'))
                        }
                    }}
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col span={24} className={'mb-4'}>
                            <Divider orientation={'left'}>
                                <Typography.Title level={5}>{t('Данные о Заявителе:')}</Typography.Title>
                            </Divider>
                        </Col>
                        <Col xs={4}>
                            <Form.Item name={'client'} label={t('Физ / юр. лицо:')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Radio.Group options={[{value: 'person', label: t('физ.лицо')}, {
                                    value: 'organization',
                                    label: t('юр.лицо')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col xs={20}>
                            {isEqual(client, 'person') && <Row gutter={16}>
                                <Col xs={4}>
                                    <Form.Item
                                        label={t("Серия паспорта")}
                                        name={['applicant', 'person', 'passportData', 'seria']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={4}>
                                    <Form.Item
                                        label={t("Номер паспорта")}
                                        name={['applicant', 'person', 'passportData', 'number']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <MaskedInput mask={'9999999'} placeholder={'_______'}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item
                                        initialValue={get(user, 'pin')}
                                        label={t("ПИНФЛ")}
                                        name={['applicant', 'person', 'passportData', 'pinfl']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <MaskedInput mask={'99999999999999'} placeholder={'______________'}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item label={' '}>
                                        <Button loading={isPending} icon={<ReloadOutlined/>} onClick={getPersonInfo}
                                                type="primary">
                                            {t('Найти')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>}
                            {isEqual(client, 'organization') && <Row gutter={16}>
                                <Col xs={4}>
                                    <Form.Item
                                        label={t("ИНН")}
                                        name={['applicant', 'organization', 'inn']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <MaskedInput mask={'999999999'} placeholder={'_________'}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={6}>
                                    <Form.Item label={' '}>
                                        <Button loading={isPending} icon={<ReloadOutlined/>} onClick={getOrgInfo}
                                                type="primary">
                                            {t('Найти')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>}
                        </Col>
                    </Row>
                    {isEqual(client, 'person') ? <Row gutter={16}>
                        <Col>
                            <Form.Item name={['applicant', 'person', 'birthDate']} label={t('Дата рождения')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <DatePicker/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'fullName', 'lastname']} label={t('Фамилия')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'fullName', 'firstname']} label={t('Имя')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'fullName', 'middlename']} label={t('Отчество')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'residentType']} label={t('Резидент')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={residentTypes}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210} name={['applicant', 'person', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'gender']} label={t('Пол')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={[
                                    {
                                        value: 'm',
                                        label: t('мужчина')
                                    },
                                    {
                                        value: 'f',
                                        label: t('женщина')
                                    }
                                ]}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'districtId']} label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name={['applicant', 'person', 'address']} label={t('Адрес')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'driverLicenseSeria']}
                                       label={t(' Серия вод. удостоверения')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'person', 'driverLicenseNumber']}
                                       label={t('Номер вод. удостоверения')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Телефон")}
                                name={['applicant', 'person', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Электронная почта")}
                                name={['applicant', 'person', 'email']}
                                rules={[
                                    {
                                        type: 'email',
                                        message: t('Введите действительный адрес электронной почты'),
                                    },
                                ]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>

                    </Row> : <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['applicant', 'organization', 'name']}
                                       label={t('Наименование')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'organization', 'ownershipFormId']}
                                       label={t('Форма собственности')}
                            >
                                <Select options={ownershipForms}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['applicant', 'organization', 'oked']}
                                       label={t('ОКЭД')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210} name={['applicant', 'organization', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'organization', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'organization', 'districtId']} label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name={['applicant', 'organization', 'address']} label={t('Адрес')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'organization', 'checkingAccount']}
                                       label={t('Расчетный счет')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'organization', 'representativeName']}
                                       label={t('Фамилия представителя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['applicant', 'organization', 'position']}
                                       label={t('Должность представителя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Контактный номер")}
                                name={['applicant', 'organization', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Электронная почта")}
                                name={['applicant', 'organization', 'email']}
                                rules={[
                                    {
                                        type: 'email',
                                        message: t('Введите действительный адрес электронной почты'),
                                    },
                                ]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>}
                    <Row gutter={16}>
                        <Col span={24} className={'mb-4'}>
                            <Divider orientation={'left'}>
                                <Typography.Title level={5}>{t('Обстоятельства события:')}</Typography.Title>
                            </Divider>
                            <Row gutter={16}>
                                <Col xs={6}>
                                    <Form.Item name={'polisSeria'} label={t('Серия полиса')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name={'polisNumber'} label={t('Номер полиса')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name={['eventCircumstances', 'applicantStatus']} label={t('Ваш статус')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>
                                        <Radio.Group options={[{
                                            value: 'страхователь',
                                            label: 'страхователь'
                                        },
                                            {
                                                value: 'пострадавший',
                                                label: 'пострадавший'
                                            }
                                        ]}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name={['eventCircumstances', 'eventDateTime']}
                                               label={t('Дата и время события')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>
                                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name={['eventCircumstances', 'place']} label={t('Место события')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>

                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item initialValue={210} name={['eventCircumstances', 'countryId']}
                                               label={t('Страна')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Select options={countryList}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name={['eventCircumstances', 'regionId']} label={t('Область')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>
                                        <Select options={regions}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item name={['eventCircumstances', 'districtId']} label={t('Район')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Select options={districts}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name={['eventCircumstances', 'eventInfo']}
                                               label={t('Сведения о событии')}

                                    >
                                        <Input.TextArea/>
                                    </Form.Item>
                                </Col>

                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={16} align="middle">
                        <Col span={20}>
                            <Divider orientation={'left'}>{t('Подтверждающие фото- и видео-материалы:')}</Divider>
                        </Col>

                        <Col span={4} className={'text-right'}>
                            <Form.Item label={' '}
                            >
                                <Button icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                                    {t('Добавить файл')}
                                </Button>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Table
                                loading={isPendingDelete}
                                dataSource={files}
                                columns={[
                                    {
                                        title: t('Имя файла'),
                                        dataIndex: 'filename',
                                    },
                                    {
                                        title: t('Тип файла'),
                                        dataIndex: 'mimetype',
                                    },
                                    {
                                        title: t('URL-адрес файла'),
                                        dataIndex: 'url',
                                    },
                                    {
                                        title: t('Действия'),
                                        dataIndex: '_id',
                                        render: (text, record) => <Button onClick={() => removeFile(record)} danger
                                                                          shape="circle" icon={<DeleteOutlined/>}/>
                                    }
                                ]}
                            />
                        </Col>
                    </Row>
                    <Flex className={'mt-6'}>
                        <Button className={'mr-2'} type="primary" htmlType={'submit'} name={'save'}>
                            {t('Сохранять')}
                        </Button>
                        <Button danger type={'primary'} onClick={() => navigate('/claims')}>
                            {t('Отменить')}
                        </Button>
                    </Flex>
                </Form>
            </Spin>
            <Drawer title={t('Добавить файл')} open={open} onClose={() => setOpen(false)}>

                <div className={'h-60'}>
                    <Dragger

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

export default AgreementEditPage;
