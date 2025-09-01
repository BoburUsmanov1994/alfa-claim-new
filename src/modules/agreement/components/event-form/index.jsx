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
                   eventCircumstances,
                   countryList = [],
                   regions = [],
                   data = {},
                   areaTypes = []
               }) => {
    const {t} = useTranslation();
    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(eventCircumstances, 'regionId')],
        url: URLS.districts,
        params: {
            params: {
                region: get(eventCircumstances, 'regionId')
            }
        },
        enabled: !!(get(eventCircumstances, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.result`, []), 'id', 'name')
    return (
        <>
            <Row gutter={16}>
                <Col span={24} className={'mb-4'}>
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
                            <Form.Item name={'applicantStatus'} label={t('Ваш статус')}
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
                                <DatePicker className={'w-full'} showTime format="DD.MM.YYYY HH:mm:ss"/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'place']} label={t('Место события')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>

                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'areaTypeId']} label={t('Тип местности')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>

                                <Select options={areaTypes} allowClear/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={parseInt(get(data, 'eventCircumstances.countryId', 210))}
                                       name={['eventCircumstances', 'countryId']}
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
        </>
    );
};

export default Index;
