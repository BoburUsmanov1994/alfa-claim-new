import React, {useState} from 'react';
import {
    Button,
    Col, DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Input,
    InputNumber, Radio,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Table
} from "antd";
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {get, isEqual} from "lodash";
import {filter} from "lodash/collection";
import MaskedInput from "../../../../components/masked-input";
import {useTranslation} from "react-i18next";
import {useGetAllQuery} from "../../../../hooks/api";
import {KEYS} from "../../../../constants/key";
import {URLS} from "../../../../constants/url";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";

const Index = ({
                   countryList = [],
                   getPersonInfo = () => {
                   },
                   vehicleDamage = [],
                   getVehicleInfo = () => {
                   },
                   regions = [],
                   vehicleTypes = [],
                   setVehicleDamage,
                   isPending = false,
                   getOrgInfo = () => {
                   },
                   residentTypes = [],
                   ownershipForms = [],
                   title = 'Добавление информации о вреде автомобилю:'
               }) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const {vehicle, owner} = Form.useWatch([], form) || {}

    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(vehicle, 'regionId'), get(vehicle, 'ownerPerson.regionId'), get(vehicle, 'ownerOrganization.regionId')],
        url: URLS.districts,
        params: {
            params: {
                region: get(vehicle, 'regionId') || get(vehicle, 'ownerPerson.regionId') || get(vehicle, 'ownerOrganization.regionId')
            }
        },
        enabled: !!(get(vehicle, 'regionId') || get(vehicle, 'ownerPerson.regionId') || get(vehicle, 'ownerOrganization.regionId')),
    })
    districts = getSelectOptionsListFromData(get(districts, `data.result`, []), 'id', 'name')


    return (
        <>
            <Row gutter={16} align="middle">
                <Col span={20}>
                    <Divider orientation={'left'}>{t(title)}</Divider>
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
                        className={'mb-4'}
                        dataSource={vehicleDamage}
                        columns={[
                            {
                                title: t('Гос.номер'),
                                dataIndex: 'vehicle',
                                render: (text) => get(text, 'govNumber')
                            },
                            {
                                title: t('Модель'),
                                dataIndex: 'vehicle',
                                align: 'center',
                                render: (text) => get(text, 'modelCustomName')
                            },
                            {
                                title: t('Серия тех.паспорта'),
                                dataIndex: 'vehicle',
                                align: 'center',
                                render: (text) => get(text, 'techPassport.seria')
                            },
                            {
                                title: t('Номер тех.паспорта'),
                                dataIndex: 'vehicle',
                                align: 'center',
                                render: (text) => get(text, 'techPassport.number')
                            },
                            {
                                title: t('Действия'),
                                dataIndex: '_id',
                                align: 'center',
                                render: (text, record, index) => <Space>
                                    <Button
                                        onClick={() => setVehicleDamage(prev => filter(prev, (_, _index) => !isEqual(_index, index)))}
                                        danger
                                        shape="circle" icon={<DeleteOutlined/>}/>
                                </Space>
                            }
                        ]}
                    />
                </Col>
            </Row>
            <Drawer width={1200} title={t('Добавление информации о вреде автомобилю')} open={open}
                    onClose={() => setOpen(false)}>
                <Spin spinning={isPending}>
                    <Form
                        name="vehicle-damage"
                        layout="vertical"
                        onFinish={(_attrs) => {
                            setVehicleDamage(prev => [...prev, _attrs]);
                            setOpen(false)
                            form.resetFields();
                        }}
                        initialValues={{
                            owner: 'person'
                        }}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col xs={4}>
                                <Form.Item
                                    label={t("Серия тех. паспорта")}
                                    name={['vehicle', 'techPassport', 'seria']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'aaa'} className={'uppercase'} placeholder={'__'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Номер тех. паспорта")}
                                    name={['vehicle', 'techPassport', 'number']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'9999999'} placeholder={'_______'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={8}>
                                <Form.Item
                                    label={t("Регистрационный номер")}
                                    name={['vehicle', 'govNumber']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item label={' '}>
                                    <Button loading={isPending} icon={<ReloadOutlined/>}
                                            onClick={() => getVehicleInfo(['vehicle'], form)}
                                            type="primary">
                                        {t('Найти')}
                                    </Button>
                                </Form.Item>
                            </Col>

                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'vehicleTypeId']} label={t('Тип авто')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={vehicleTypes}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'modelCustomName']} label={t('Марка')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['vehicle', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'bodyNumber']}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                           label={t('Номер кузова')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'engineNumber']} label={t('Номер двигателя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'liftingCapacity']} label={t('Грузоподъемность')}
                                >
                                    <InputNumber/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'numberOfSeats']} label={t('Количество мест')}
                                >
                                    <InputNumber className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'issueYear']} label={t('Год выпуска')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <InputNumber className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item valuePropName="checked"
                                           initialValue={false} name={['vehicle', 'isForeign']}
                                           label={t('Является иностранным')}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>

                            <Col xs={24}>
                                <Divider/>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={'owner'} label={t('Владелец авто')}
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
                                            name={['vehicle', 'ownerPerson', 'passportData', 'seria']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item
                                            label={t("Номер паспорта")}
                                            name={['vehicle', 'ownerPerson', 'passportData', 'number']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'9999999'} placeholder={'_______'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={8}>
                                        <Form.Item
                                            label={t("ПИНФЛ")}
                                            name={['vehicle', 'ownerPerson', 'passportData', 'pinfl']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'99999999999999'} placeholder={'______________'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={4}>
                                        <Form.Item label={' '}>
                                            <Button loading={isPending} icon={<ReloadOutlined/>}
                                                    onClick={() => getPersonInfo(['vehicle', 'ownerPerson'], form)}
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
                                            name={['vehicle', 'ownerOrganization', 'inn']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'999999999'} placeholder={'_________'}/>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={6}>
                                        <Form.Item label={' '}>
                                            <Button loading={isPending} icon={<ReloadOutlined/>}
                                                    onClick={() => getOrgInfo(['vehicle', 'ownerOrganization'], form)}
                                                    type="primary">
                                                {t('Найти')}
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>}
                            </Col>
                        </Row>
                        {isEqual(owner, 'person') ? <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'birthDate']} label={t('Дата рождения')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'fullName', 'lastname']}
                                           label={t('Фамилия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'fullName', 'firstname']} label={t('Имя')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'fullName', 'middlename']}
                                           label={t('Отчество')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'residentType']} label={t('Резидент')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={residentTypes}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['vehicle', 'ownerPerson', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'gender']} label={t('Пол')}
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
                                <Form.Item name={['vehicle', 'ownerPerson', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'driverLicenseSeria']}
                                           label={t(' Серия вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerPerson', 'driverLicenseNumber']}
                                           label={t('Номер вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['vehicle', 'ownerPerson', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['vehicle', 'ownerPerson', 'email']}
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
                                           name={['vehicle', 'ownerOrganization', 'name']}
                                           label={t('Наименование')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'ownershipFormId']}
                                           label={t('Форма собственности')}
                                >
                                    <Select options={ownershipForms}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['vehicle', 'ownerOrganization', 'oked']}
                                           label={t('ОКЭД')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['vehicle', 'ownerOrganization', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'checkingAccount']}
                                           label={t('Расчетный счет')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'representativeName']}
                                           label={t('Фамилия представителя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['vehicle', 'ownerOrganization', 'position']}
                                           label={t('Должность представителя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Контактный номер")}
                                    name={['vehicle', 'ownerOrganization', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['vehicle', 'ownerOrganization', 'email']}
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
