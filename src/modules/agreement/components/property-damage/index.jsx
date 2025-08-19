import React, {useState} from 'react';
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Input,
    Radio,
    Row,
    Select,
    Space,
    Spin, Switch,
    Table
} from "antd";
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

const Index = ({otherPropertyDamage=[],setOtherPropertyDamage}) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const {owner,ownerPerson,ownerOrganization} = Form.useWatch([], form) || {}
    const {mutate, isPending} = usePostQuery({})

    let {data: residentTypes} = useGetAllQuery({
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
        key: [KEYS.districts, get(ownerPerson, 'regionId'),get(ownerOrganization, 'regionId')],
        url: URLS.districts,
        params: {
            params: {
                region:  get(ownerPerson, 'regionId') || get(ownerOrganization, 'regionId')
            }
        },
        enabled: !!(get(ownerPerson, 'regionId') || get(ownerOrganization, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.result`, []), 'id', 'name')

    const getPersonInfo = (_form = form, type = ['ownerPerson']) => {
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
                inn: form.getFieldValue(['ownerOrganization', 'inn']),
            }
        }, {
            onSuccess: ({data: {result} = {}}) => {
                form.setFieldValue(['ownerOrganization', 'name'], get(result, 'name'))
                form.setFieldValue(['ownerOrganization', 'oked'], get(result, 'oked'))
                form.setFieldValue(['ownerOrganization', 'address'], get(result, 'address'))
                form.setFieldValue(['ownerOrganization', 'checkingAccount'], get(result, 'account'))
                form.setFieldValue(['ownerOrganization', 'representativeName'], get(result, 'gdFullName'))
                form.setFieldValue(['ownerOrganization', 'phone'], get(result, 'phone'))
                form.setFieldValue(['ownerOrganization', 'email'], get(result, 'email'))
            }
        })
    }
    let {data: ownershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms,
        url: URLS.ownershipForms,
    });
    ownershipForms = getSelectOptionsListFromData(get(ownershipForms, `data.result`, []), 'id', 'name')
    return (
        <>
            <Row gutter={16} align="middle">
                <Col span={20}>
                    <Divider orientation={'left'}>{t('Добавление информации о вреде имуществу:')}</Divider>
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
                        dataSource={otherPropertyDamage}
                        columns={[
                            {
                                title: t('Описание имущества'),
                                dataIndex: 'property',
                            },
                            {
                                title: t('Действия'),
                                dataIndex: '_id',
                                render: (text, record, index) => <Space>
                                    <Button
                                        onClick={() => setOtherPropertyDamage(prev => filter(prev, (_, _index) => !isEqual(_index, index)))}
                                        danger
                                        shape="circle" icon={<DeleteOutlined/>}/>
                                </Space>
                            }
                        ]}
                    />
                </Col>
            </Row>
            <Drawer width={1200} title={t('Добавление информации о вреде имуществу')} open={open}
                    onClose={() => setOpen(false)}>
                <Spin spinning={isPending}>
                    <Form
                        name="health-damage"
                        layout="vertical"
                        onFinish={(_attrs) => {
                            setOtherPropertyDamage(prev => [...prev, _attrs]);
                            setOpen(false)
                        }}
                        form={form}
                        initialValues={{
                            owner:'person'
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                    <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}  name={'property'} label={t("Информация об имуществе")}
                                    >
                                        <Input.TextArea/>
                                    </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={'owner'} label={t('Владелец имущества')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Radio.Group options={[{value: 'person', label: t('физ.лицо')}, {
                                        value: 'organization',
                                        label: t('юр.лицо')
                                    }]}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item valuePropName="checked"
                                           initialValue={false} name={'insurantIsOwner'} label={t("Владеет Заявитель")}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                {isEqual(owner, 'person') && <Row gutter={16}>
                                    <Col xs={6}>
                                        <Form.Item
                                            label={t("Серия паспорта")}
                                            name={['ownerPerson', 'passportData', 'seria']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item
                                            label={t("Номер паспорта")}
                                            name={['ownerPerson', 'passportData', 'number']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'9999999'} placeholder={'_______'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={8}>
                                        <Form.Item
                                            label={t("ПИНФЛ")}
                                            name={[ 'ownerPerson', 'passportData', 'pinfl']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'99999999999999'} placeholder={'______________'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={4}>
                                        <Form.Item label={' '}>
                                            <Button loading={isPending} icon={<ReloadOutlined/>}
                                                    onClick={() => getPersonInfo()}
                                                    type="primary">
                                                {t('Найти')}
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>}
                                {isEqual(owner, 'organization') && <Row gutter={16}>
                                    <Col xs={4}>
                                        <Form.Item
                                            label={t("ИНН")}
                                            name={['ownerOrganization', 'inn']}
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
                        {isEqual(owner, 'person') ? <Row gutter={16}>
                            <Col>
                                <Form.Item name={['ownerPerson', 'birthDate']} label={t('Дата рождения')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'fullName', 'lastname']}
                                           label={t('Фамилия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'fullName', 'firstname']} label={t('Имя')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'fullName', 'middlename']}
                                           label={t('Отчество')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'residentType']} label={t('Резидент')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={residentTypes}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['ownerPerson', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'gender']} label={t('Пол')}
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
                                <Form.Item name={['ownerPerson', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['ownerPerson', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'driverLicenseSeria']}
                                           label={t(' Серия вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'driverLicenseNumber']}
                                           label={t('Номер вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['ownerPerson', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['ownerPerson', 'email']}
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
                                           name={['ownerOrganization', 'name']}
                                           label={t('Наименование')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'ownershipFormId']}
                                           label={t('Форма собственности')}
                                >
                                    <Select options={ownershipForms}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['ownerOrganization', 'oked']}
                                           label={t('ОКЭД')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['ownerOrganization', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={[ 'ownerOrganization', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'checkingAccount']}
                                           label={t('Расчетный счет')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'representativeName']}
                                           label={t('Фамилия представителя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'position']}
                                           label={t('Должность представителя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Контактный номер")}
                                    name={['ownerOrganization', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['organization', 'email']}
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
                        <Flex className={'mt-6'}>
                            <Button className={'mr-2'} type="primary" htmlType={'submit'} name={'save'}>
                                {t('Добавить')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => {
                                form.resetFields({})
                                setOpen(false)
                            }}>
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
