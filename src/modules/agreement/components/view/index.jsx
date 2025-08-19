import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Input,
    notification,
    Radio,
    Row,
    Select,
    Table, Typography,
    Upload,
} from "antd";
import {useTranslation} from "react-i18next";
import {get, isEmpty, isEqual, toUpper} from "lodash"
import dayjs from "dayjs";
import MaskedInput from "../../../../components/masked-input";
import {DeleteOutlined, InboxOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../../hooks/api";
import {KEYS} from "../../../../constants/key";
import {URLS} from "../../../../constants/url";
import useAuth from "../../../../hooks/auth/useAuth";
import {useNavigate} from "react-router-dom";
import LifeDamage from "../life-damage";
import HealthDamage from "../health-damage";
import VehicleDamage from "../vehicle-damage";
import PropertyDamage from "../property-damage";
import {request} from "../../../../services/api";

const {Dragger} = Upload;

const Index = ({
                   data,
                   id
               }) => {
    const {t} = useTranslation();
    const {user} = useAuth()
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const {
        applicant,
        client,
        eventCircumstances,
        bankDetails,
        hasLifeDamage,
        hasHealthDamage,
        hasVehicleDamage,
        hasPropertyDamage
    } = Form.useWatch([], form) || {}
    const submitType = useRef(null)
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [lifeDamage, setLifeDamage] = useState([]);
    const [healthDamage, setHealthDamage] = useState([]);
    const [vehicleDamage, setVehicleDamage] = useState([]);
    const [otherPropertyDamage, setOtherPropertyDamage] = useState([]);
    const {mutate, isPending} = usePostQuery({})
    const {mutate: patchRequest, isPending: isPendingPatch} = usePutQuery({})
    const {mutate: deleteRequest, isPending: isPendingDelete} = useDeleteQuery({})
    let {data: residentTypes, isLoading: isLoadingResident} = useGetAllQuery({
        key: KEYS.residentType,
        url: URLS.residentType,
    });
    residentTypes = getSelectOptionsListFromData(get(residentTypes, `data.result`, []), 'id', 'name')


    const {data: country} = useGetAllQuery({
        key: KEYS.countries, url: `${URLS.countries}`
    })
    const countryList = getSelectOptionsListFromData(get(country, `data.result`, []), 'id', 'name')

    let {data: regions} = useGetAllQuery({
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

    let {data: ownershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms,
        url: URLS.ownershipForms,
    });
    ownershipForms = getSelectOptionsListFromData(get(ownershipForms, `data.result`, []), 'id', 'name')

    const getPersonInfo = (_form = form, type = ['applicant', 'person']) => {
        mutate({
            url: URLS.personalInfo,
            attributes: {
                passportSeries: toUpper(_form.getFieldValue([...type, 'passportData', 'seria'])),
                passportNumber: _form.getFieldValue([...type, 'passportData', 'number']),
                pinfl: _form.getFieldValue([...type, 'passportData', 'pinfl']),
            }
        }, {
            onSuccess: ({data: {result} = {}}) => {
                _form.setFieldValue([...type, 'birthDate'], dayjs(get(result, 'birthDate')))
                _form.setFieldValue([...type, 'fullName', 'firstname'], get(result, 'firstNameLatin'))
                _form.setFieldValue([...type, 'fullName', 'lastname'], get(result, 'lastNameLatin'))
                _form.setFieldValue([...type, 'fullName', 'middlename'], get(result, 'middleNameLatin'))
                _form.setFieldValue([...type, 'gender'], get(result, 'gender'))
                _form.setFieldValue([...type, 'regionId'], get(result, 'regionId'))
                _form.setFieldValue([...type, 'districtId'], get(result, 'districtId'))
                _form.setFieldValue([...type, 'address'], get(result, 'address'))
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

    const removeFile = (_file) => {
        setFiles(prev => prev.filter(item => item._id !== _file._id));
        deleteRequest({url: `${URLS.file}/${get(_file, '_id')}`}, {
            onSuccess: () => {

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

    const onFinish = ({
                          client,
                          eventCircumstances,
                          hasHealthDamage,
                          hasLifeDamage,
                          hasPropertyDamage,
                          hasVehicleDamage,
                          ...rest
                      }) => {
        patchRequest({
            url: URLS.claimEdit,
            attributes: {
                id,
                ...rest,
                eventCircumstances: {
                    ...eventCircumstances,
                    countryId: String(get(eventCircumstances, 'countryId'))
                },
                photoVideoMaterials: files?.map(({_id, url,file}) => ({file: _id ?? file, url})),
                lifeDamage,
                healthDamage,
                vehicleDamage,
                otherPropertyDamage
            }
        }, {
            onSuccess: () => {
                form.resetFields();
                navigate('/agreements')
            }
        })
    };
    useEffect(() => {
        if (!isEmpty(get(data, 'photoVideoMaterials', []))) {
            setFiles(get(data, 'photoVideoMaterials', []))
        }
        if (!isEmpty(get(data, 'lifeDamage', []))) {
            setLifeDamage(get(data, 'lifeDamage', []))
            form.setFieldValue('hasLifeDamage',true)
        }
        if (!isEmpty(get(data, 'healthDamage', []))) {
            setHealthDamage(get(data, 'healthDamage', []))
            form.setFieldValue('hasHealthDamage',true)
        }
        if (!isEmpty(get(data, 'vehicleDamage', []))) {
            setVehicleDamage(get(data, 'vehicleDamage', []))
            form.setFieldValue('hasVehicleDamage',true)
        }
        if (!isEmpty(get(data, 'otherPropertyDamage', []))) {
            setOtherPropertyDamage(get(data, 'otherPropertyDamage', []))
            form.setFieldValue('hasPropertyDamage',true)
        }
    }, [data])

    return (
        <>
            <Form onFinish={onFinish} layout="vertical" initialValues={{
                client: get(data, 'applicant.person') ? 'person' : 'organization',
                ...data,
                applicant: {
                    ...get(data, 'applicant'),
                    person: {
                        ...get(data, 'applicant.person'),
                        birthDate: dayjs(get(data, 'applicant.person.birthDate')),
                    },
                },
                eventCircumstances: {
                    ...get(data, 'eventCircumstances'),
                    eventDateTime: dayjs(get(data, 'eventCircumstances.eventDateTime'))
                }
            }} form={form}>
                <Row gutter={32}>
                    <Col span={24}>
                        <Divider orientation={'left'}>{t('Статус заявления:')}</Divider>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Статус')}>
                            <Input value={get(data, 'status')} disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Регистрационный номер')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Дата и время регистрации')}>
                            <DatePicker value={dayjs(get(data, 'createdAt'))} disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Должность сотрудника')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Ф.И.О. сотрудника')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Контактный номер')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Принятое решение')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Дата решения')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Причина отказа')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Divider orientation={'left'}>{t('Банковские реквизиты:')}</Divider>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['bankDetails', 'mfo']} label={t('МФО банка')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['bankDetails', 'name']} label={t('Наименование банка')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['bankDetails', 'inn']} label={t('ИНН банка')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['bankDetails', 'checkingAccount']} label={t('Расчетный счет')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item initialValue={'PERSON'} name={['bankDetails', 'receiver', 'type']}
                                   label={t('Получатель')}
                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                            <Radio.Group options={[{value: 'PERSON', label: t('физ.лицо')}, {
                                value: 'ORGANIZATION',
                                label: t('юр.лицо')
                            }]}/>
                        </Form.Item>
                    </Col>
                    {isEqual(get(bankDetails, 'receiver.type'), 'PERSON') ? <>
                        <Col span={6}>
                            <Form.Item name={['bankDetails', 'receiver', 'person', 'fullName', 'lastname']}
                                       label={t('Фамилия')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={['bankDetails', 'receiver', 'person', 'fullName', 'firstname']}
                                       label={t('Имя')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={['bankDetails', 'receiver', 'person', 'fullName', 'middlename']}
                                       label={t('Отчество')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={['bankDetails', 'receiver', 'person', 'cardNumber']}
                                       label={t('Номер пласт. карты')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    </> : <Col span={6}>
                        <Form.Item name={['bankDetails', 'receiver', 'organization', 'name']}
                                   label={t('Наименование')}>
                            <Input/>
                        </Form.Item>
                    </Col>}

                    <Col span={24}>
                        <Divider orientation={'left'}>{t('Заявленный ущерб и выплаты:')}</Divider>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t(' Общая сумма ущерба')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплаченное страховое возмещение')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб по жизни')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплата по жизни')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб по здоровью')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплата по здоровью')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб авто')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплата по имуществу')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб имуществу')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Divider orientation={'left'}>{t('Данные о Заявителе:')}</Divider>
                    </Col>
                    <Col xs={6}>
                        <Form.Item name={'client'} label={t('Физ / юр. лицо:')}
                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                            <Radio.Group options={[{value: 'person', label: t('физ.лицо')}, {
                                value: 'organization',
                                label: t('юр.лицо')
                            }]}/>
                        </Form.Item>
                    </Col>
                    <Col xs={18}>
                        {isEqual(client, 'person') && <Row gutter={16}>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Серия паспорта")}
                                    name={['applicant', 'person', 'passportData', 'seria']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
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
                                    <Button loading={isPending} icon={<ReloadOutlined/>}
                                            onClick={() => getPersonInfo()}
                                            type="primary">
                                        {t('Найти')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>}
                        {isEqual(client, 'organization') && <Row gutter={16}>
                            <Col xs={6}>
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
                </Row>
                }
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
                <Row gutter={16}>
                    <Col span={24}>
                        <Divider orientation={'left'}>{t('Понесенный ущерб:')}</Divider>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            initialValue={false}
                            layout={'horizontal'}
                            label={t("Вред жизни (летальный исход)")}
                            name={'hasLifeDamage'}
                        >
                            <Radio.Group options={[{value: false, label: t('нет')}, {
                                value: true,
                                label: t('нанесен')
                            }]}/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        {
                            hasLifeDamage &&
                            <LifeDamage title={'Потерпевшие'} setLifeDamage={setLifeDamage} lifeDamage={lifeDamage}/>
                        }
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            initialValue={false}
                            layout={'horizontal'}
                            label={t("Вред здоровью:")}
                            name={'hasHealthDamage'}
                        >
                            <Radio.Group options={[{value: false, label: t('нет')}, {
                                value: true,
                                label: t('нанесен')
                            }]}/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        {
                            hasHealthDamage && <HealthDamage title={'Потерпевшие'} setHealthDamage={setHealthDamage}
                                                             healthDamage={healthDamage}/>
                        }
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            initialValue={false}
                            layout={'horizontal'}
                            label={t("Вред автомобилю:")}
                            name={'hasVehicleDamage'}
                        >
                            <Radio.Group options={[{value: false, label: t('нет')}, {
                                value: true,
                                label: t('нанесен')
                            }]}/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        {
                            hasVehicleDamage &&
                            <VehicleDamage title={'Пострадавшие ТС'} setVehicleDamage={setVehicleDamage}
                                           vehicleDamage={vehicleDamage}/>
                        }
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            initialValue={false}
                            layout={'horizontal'}
                            label={t("Вред имуществу:")}
                            name={'hasPropertyDamage'}
                        >
                            <Radio.Group options={[{value: false, label: t('нет')}, {
                                value: true,
                                label: t('нанесен')
                            }]}/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        {
                            hasPropertyDamage && <PropertyDamage title={'Пострадавшее имущество'}
                                                                 setOtherPropertyDamage={setOtherPropertyDamage}
                                                                 otherPropertyDamage={otherPropertyDamage}/>
                        }
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
                <Row gutter={16} align="middle">
                    <Col span={20}>
                        <Divider orientation={'left'}>{t('Запрос на редактирование:')}</Divider>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label={t("Текст запроса")}
                            name={['editRequest', 'text']}
                        >
                            <Input.TextArea/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label={t("Результат")}
                        >
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label={t("Кем принято решение")}
                        >
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label={t("Комментарий")}
                        >
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                </Row>
                <Flex className={'mt-6'}>
                    <Button onClick={() => (submitType.current = true)} className={'mr-3'} type="primary"
                            htmlType={'submit'} name={'save'}>
                        {t('Дополнить заявление')}
                    </Button>
                    <Button danger type={'primary'} onClick={() => navigate('/claims')}>
                        {t('Отмена')}
                    </Button>
                </Flex>
            </Form>
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

export default Index;
