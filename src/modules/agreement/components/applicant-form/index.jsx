import React from 'react';
import {Button, Col, DatePicker, Divider, Form, Input, Radio, Row, Select} from "antd";
import {get, isEqual} from "lodash";
import MaskedInput from "../../../../components/masked-input";
import {ReloadOutlined} from "@ant-design/icons";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";
import {useTranslation} from "react-i18next";
import useAuth from "../../../../hooks/auth/useAuth";
import {useGetAllQuery} from "../../../../hooks/api";
import {KEYS} from "../../../../constants/key";
import {URLS} from "../../../../constants/url";

const Index = ({
                   client,
                   applicant,
                   isPending = false,
                   getPersonInfo = () => {
                   },
                   getOrgInfo = () => {
                   },
                   residentTypes = [],
                   countryList = [],
                   regions = [],
                   ownershipForms = [],
               }) => {
    const {t} = useTranslation();
    const {user} = useAuth()
    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(applicant, 'person.regionId'), get(applicant, 'organization.regionId')],
        url: URLS.districts,
        params: {
            params: {
                region: get(applicant, 'person.regionId') || get(applicant, 'organization.regionId')
            }
        },
        enabled: !!(get(applicant, 'person.regionId') || get(applicant, 'organization.regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.result`, []), 'id', 'name')
    return (
        <>
            <Row gutter={16}>
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
                                <Button loading={isPending} icon={<ReloadOutlined/>} onClick={()=>getOrgInfo()}
                                        type="primary">
                                    {t('Найти')}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>}
                </Col>
            </Row>
            {isEqual(client, 'person') ? <Row gutter={16}>
                <Col xs={6}>
                    <Form.Item name={['applicant', 'person', 'passportData', 'givenPlace']}
                               label={t(' Кем выдан паспорт')}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={['applicant', 'person', 'passportData', 'issueDate']}
                               label={t('Дата выдачи паспорта')}
                    >
                        <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={['applicant', 'person', 'birthDate']} label={t('Дата рождения')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
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
        </>
    );
};

export default Index;
