import React, {useState} from 'react';
import {Button, Col, DatePicker, Divider, Drawer, Flex, Form, Input, Row, Select, Space, Spin, Table} from "antd";
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {get, isEqual, toUpper} from "lodash";
import {filter} from "lodash/collection";
import {useTranslation} from "react-i18next";
import MaskedInput from "../../../../components/masked-input";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";
import {useGetAllQuery, usePostQuery} from "../../../../hooks/api";
import {URLS} from "../../../../constants/url";
import dayjs from "dayjs";
import {KEYS} from "../../../../constants/key";

const Index = ({healthDamage=[],setHealthDamage}) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const {person} = Form.useWatch([], form) || {}
    const {mutate, isPending} = usePostQuery({})

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
        key: [KEYS.districts, get(person, 'regionId')],
        url: URLS.districts,
        params: {
            params: {
                region:  get(person, 'regionId')
            }
        },
        enabled: !!(get(person, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.result`, []), 'id', 'name')

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
    return (
        <>
            <Row gutter={16} align="middle">
                <Col span={20}>
                    <Divider orientation={'left'}>{t('Добавление информации о вреде здоровью:')}</Divider>
                </Col>
                <Col span={4} className={'text-right'}>
                    <Form.Item label={' '}
                    >
                        <Button icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                            {t('Добавить')}
                        </Button>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Table
                        dataSource={healthDamage}
                        columns={[
                            {
                                title: t('ПИНФЛ'),
                                dataIndex: 'person',
                                render: (text) => get(text, 'passportData.pinfl')
                            },
                            {
                                title: t('Фамилия'),
                                dataIndex: 'person',
                                render: (text) => get(text, 'fullName.lastname')
                            },
                            {
                                title: t('Имя'),
                                dataIndex: 'person',
                                render: (text) => get(text, 'fullName.firstname')
                            },
                            {
                                title: t('Отчество'),
                                dataIndex: 'person',
                                render: (text) => get(text, 'fullName.middlename')
                            },
                            {
                                title: t('Действия'),
                                dataIndex: '_id',
                                render: (text, record, index) => <Space>
                                    <Button
                                        onClick={() => setHealthDamage(prev => filter(prev, (_, _index) => !isEqual(_index, index)))}
                                        danger
                                        shape="circle" icon={<DeleteOutlined/>}/>
                                </Space>
                            }
                        ]}
                    />
                </Col>
            </Row>
            <Drawer width={1200} title={t('Добавление информации о вреде здоровью')} open={open}
                    onClose={() => setOpen(false)}>
                <Spin spinning={isPending}>
                    <Form
                        name="health-damage"
                        layout="vertical"
                        onFinish={(_attrs) => {
                            setHealthDamage(prev => [...prev, _attrs]);
                            setOpen(false)
                        }}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col xs={4}>
                                <Form.Item
                                    label={t("Серия паспорта")}
                                    name={['person', 'passportData', 'seria']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Номер паспорта")}
                                    name={['person', 'passportData', 'number']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'9999999'} placeholder={'_______'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={8}>
                                <Form.Item
                                    label={t("ПИНФЛ")}
                                    name={['person', 'passportData', 'pinfl']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'99999999999999'} placeholder={'______________'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item label={' '}>
                                    <Button loading={isPending} icon={<ReloadOutlined/>}
                                            onClick={() => getPersonInfo(form, ['person'])}
                                            type="primary">
                                        {t('Найти')}
                                    </Button>
                                </Form.Item>
                            </Col>
                            <Col>
                                <Form.Item name={['person', 'birthDate']} label={t('Дата рождения')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'fullName', 'lastname']} label={t('Фамилия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'fullName', 'firstname']} label={t('Имя')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'fullName', 'middlename']} label={t('Отчество')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'residentType']} label={t('Резидент')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={residentTypes}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['person', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'gender']} label={t('Пол')}
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
                                <Form.Item name={['person', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['person', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'driverLicenseSeria']}
                                           label={t(' Серия вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'driverLicenseNumber']}
                                           label={t('Номер вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['person', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['person', 'email']}
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
                        <Flex className={'mt-6'}>
                            <Button className={'mr-2'} type="primary" htmlType={'submit'} name={'save'}>
                                {t('Добавить')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => setOpen(false)}>
                                {t('Отмена')}
                            </Button>
                        </Flex>
                    </Form>
                </Spin>
            </Drawer>
        </>
    );
};

export default Index;
