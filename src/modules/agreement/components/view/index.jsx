import React, {useEffect, useRef, useState} from 'react';
import {
    Button, Card,
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
import {get, includes, isEmpty, isEqual, toUpper} from "lodash"
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
import ApplicantForm from "../applicant-form";
import FileForm from "../file-form";
import EventForm from "../event-form";
import numeral from "numeral"


const Index = ({
                   data,
                   id,
                   refresh = () => {
                   }
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

    let {data: ownershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms,
        url: URLS.ownershipForms,
    });
    ownershipForms = getSelectOptionsListFromData(get(ownershipForms, `data.result`, []), 'id', 'name')

    const getPersonInfo = (type = ['applicant', 'person'], _form = form) => {
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


    const getOrgInfo = (type = ['applicant', 'organization'], _form = form) => {
        mutate({
            url: URLS.orgInfo,
            attributes: {
                inn: _form.getFieldValue([...type, 'inn']),
            }
        }, {
            onSuccess: ({data: {result} = {}}) => {
                _form.setFieldValue([...type, 'name'], get(result, 'name'))
                _form.setFieldValue([...type, 'oked'], get(result, 'oked'))
                _form.setFieldValue([...type, 'address'], get(result, 'address'))
                _form.setFieldValue([...type, 'checkingAccount'], get(result, 'account'))
                _form.setFieldValue([...type, 'representativeName'], get(result, 'gdFullName'))
                _form.setFieldValue([...type, 'phone'], get(result, 'phone'))
                _form.setFieldValue([...type, 'email'], get(result, 'email'))
            }
        })
    }

    const getVehicleInfo = (type = ['vehicle', 'person'], _form = form) => {
        mutate({
            url: URLS.vehicleInfoProvider,
            attributes: {
                techPassportSeria: toUpper(_form.getFieldValue([...type, 'techPassport', 'seria'])),
                techPassportNumber: _form.getFieldValue([...type, 'techPassport', 'number']),
                govNumber: _form.getFieldValue([...type, 'govNumber']),
            }
        }, {
            onSuccess: ({data: {result} = {}}) => {
                _form.setFieldValue([...type, 'vehicleTypeId'], get(result, 'vehicleTypeId'))
                _form.setFieldValue([...type, 'modelCustomName'], get(result, 'modelName'))
                _form.setFieldValue([...type, 'regionId'], get(result, 'regionId'))
                _form.setFieldValue([...type, 'bodyNumber'], get(result, 'bodyNumber'))
                _form.setFieldValue([...type, 'engineNumber'], get(result, 'engineNumber'))
                _form.setFieldValue([...type, 'liftingCapacity'], parseInt(get(result, 'stands')))
                _form.setFieldValue([...type, 'numberOfSeats'], parseInt(get(result, 'seats')))
                _form.setFieldValue([...type, 'issueYear'], get(result, 'issueYear'))
            }
        })
    }
    let {data: vehicleTypes} = useGetAllQuery({
        key: KEYS.vehicleType,
        url: URLS.vehicleType,
    });
    vehicleTypes = getSelectOptionsListFromData(get(vehicleTypes, `data.result`, []), 'id', 'name')


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
                photoVideoMaterials: files?.map(({_id, url, file}) => ({file: _id ?? file, url})),
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
            form.setFieldValue('hasLifeDamage', true)
        }
        if (!isEmpty(get(data, 'healthDamage', []))) {
            setHealthDamage(get(data, 'healthDamage', []))
            form.setFieldValue('hasHealthDamage', true)
        }
        if (!isEmpty(get(data, 'vehicleDamage', []))) {
            setVehicleDamage(get(data, 'vehicleDamage', []))
            form.setFieldValue('hasVehicleDamage', true)
        }
        if (!isEmpty(get(data, 'otherPropertyDamage', []))) {
            setOtherPropertyDamage(get(data, 'otherPropertyDamage', []))
            form.setFieldValue('hasPropertyDamage', true)
        }
    }, [data])

    return (
        <>
            <Form disabled={!isEqual(get(data,'status'),'draft')} onFinish={onFinish} layout="vertical" initialValues={{
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
                        <Card className={'mb-4'} title={t('Статус заявления:')} bordered>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item label={t('Статус')}>
                                        <Input value={t(get(data, 'status'))} disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('Регистрационный номер')}>
                                        <Input value={get(data,'regNumber')} disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('Дата и время регистрации')}>
                                        <DatePicker className={'w-full'} value={dayjs(get(data, 'regDate'))}
                                                    disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('Должность сотрудника')}>
                                        <Input value={get(data,'employeeRole')} disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('Ф.И.О. сотрудника')}>
                                        <Input value={get(data,'employee.fullname')} disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('Контактный номер')}>
                                        <Input value={get(data,'employeeContactNumber')} disabled/>
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
                            </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        {includes(['waiting_details', 'waiting_payment', 'paid'], get(data, 'status')) &&
                            <Card className={'mb-4'} title={t('Банковские реквизиты:')} bordered>
                                {
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                                       name={['bankDetails', 'mfo']} label={t('МФО банка')}>
                                                <Input/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                                       name={['bankDetails', 'name']} label={t('Наименование банка')}>
                                                <Input/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                                       name={['bankDetails', 'inn']} label={t('ИНН банка')}>
                                                <Input/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                                       name={['bankDetails', 'checkingAccount']}
                                                       label={t('Расчетный счет')}>
                                                <Input/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item initialValue={'PERSON'}
                                                       name={['bankDetails', 'receiver', 'type']}
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
                                                <Form.Item
                                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                                    name={['bankDetails', 'receiver', 'person', 'fullName', 'lastname']}
                                                    label={t('Фамилия')}>
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                                    name={['bankDetails', 'receiver', 'person', 'fullName', 'firstname']}
                                                    label={t('Имя')}>
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                                    name={['bankDetails', 'receiver', 'person', 'fullName', 'middlename']}
                                                    label={t('Отчество')}>
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                                           name={['bankDetails', 'receiver', 'person', 'cardNumber']}
                                                           label={t('Номер пласт. карты')}>
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                        </> : <Col span={6}>
                                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                                       name={['bankDetails', 'receiver', 'organization', 'name']}
                                                       label={t('Наименование')}>
                                                <Input/>
                                            </Form.Item>
                                        </Col>}</Row>
                                }
                            </Card>}
                    </Col>

                    <Col span={24}>
                        <Card className={'mb-4'} bordered title={t('Заявленный ущерб и выплаты')}>
                                <Row gutter={16} align="top">
                                    <Col span={12}>
                                        <Row gutter={16}>
                                            <Col span={24}>
                                                <Form.Item label={t('Общая сумма ущерба')}>
                                                    <Input value={numeral(get(data, 'totalDamageSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Заявленный ущерб по жизни')}>
                                                    <Input value={numeral(get(data, 'lifeDamageSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Заявленный ущерб по здоровью')}>
                                                    <Input value={numeral(get(data, 'healthDamageSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Заявленный ущерб авто')}>
                                                    <Input value={numeral(get(data, 'vehicleDamageSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Заявленный ущерб имуществу')}>
                                                    <Input value={numeral(get(data, 'otherPropertyDamageSum')).format('0,0.00')}
                                                           disabled/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row gutter={16}>
                                            <Col span={24}>
                                                <Form.Item label={t('Выплаченное страховое возмещение')}>
                                                    <Input value={numeral(get(data, 'totalPaymentSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Выплата по жизни')}>
                                                    <Input value={numeral(get(data, 'lifePaymentSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Выплата по здоровью')}>
                                                    <Input value={numeral(get(data, 'healthPaymentSum')).format('0,0.00')} disabled/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={24}>
                                                <Form.Item label={t('Выплата по имуществу')}>
                                                    <Input value={numeral(get(data, 'otherPropertyPaymentSum')).format('0,0.00')}
                                                           disabled/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card title={t('Данные о Заявителе:')} className={'mb-4'}>
                            <ApplicantForm client={client} applicant={applicant} countryList={countryList}
                                           ownershipForms={ownershipForms} regions={regions}
                                           getPersonInfo={getPersonInfo}
                                           getOrgInfo={getOrgInfo} residentTypes={residentTypes} isPending={isPending}/>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card title={t('Обстоятельства события:')} className={'mb-4'} bordered>
                            <EventForm data={data} eventCircumstances={eventCircumstances} regions={regions}
                                       countryList={countryList}/>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card className={'mb-4'} title={t('Понесенный ущерб:')} bordered>
                            <Row gutter={16}>
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
                                        <LifeDamage residentTypes={residentTypes} getPersonInfo={getPersonInfo}
                                                    regions={regions} countryList={countryList} title={'Потерпевшие'}
                                                    setLifeDamage={setLifeDamage}
                                                    lifeDamage={lifeDamage}/>
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
                                        hasHealthDamage &&
                                        <HealthDamage isPending={isPending} getPersonInfo={getPersonInfo}
                                                      regions={regions} countryList={countryList}
                                                      residentTypes={residentTypes} title={'Потерпевшие'}
                                                      setHealthDamage={setHealthDamage}
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
                                        <VehicleDamage isPending={isPending} getPersonInfo={getPersonInfo}
                                                       getOrgInfo={getOrgInfo} residentTypes={residentTypes}
                                                       vehicleTypes={vehicleTypes} countryList={countryList}
                                                       ownershipForms={ownershipForms} regions={regions}
                                                       getVehicleInfo={getVehicleInfo} title={'Пострадавшие ТС'}
                                                       setVehicleDamage={setVehicleDamage}
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
                                        hasPropertyDamage && <PropertyDamage
                                            countryList={countryList}
                                            regions={regions}
                                            residentTypes={residentTypes}
                                            getPersonInfo={getPersonInfo}
                                            getOrgInfo={getOrgInfo}
                                            isPending={isPending}
                                            ownershipForms={ownershipForms}
                                            title={'Пострадавшее имущество'}
                                            setOtherPropertyDamage={setOtherPropertyDamage}
                                            otherPropertyDamage={otherPropertyDamage}/>
                                    }
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>


                <FileForm refresh={refresh} files={files} setFiles={setFiles}/>
                <Card className={'my-4'} title={t('Запрос на редактирование:')} bordered>
                    <Row gutter={16} align="middle">
                        <Col span={24}>
                            <Form.Item
                                label={t("Текст запроса")}
                                name={['editRequest', 'text']}
                            >
                                <Input.TextArea disabled={false}/>
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
                </Card>
                <Flex className={'mt-6'}>
                    <Button disabled={false} onClick={() => (submitType.current = true)} className={'mr-3'} type="primary"
                            htmlType={'submit'} name={'save'}>
                        {t('Дополнить заявление')}
                    </Button>
                    <Button disabled={false} danger type={'primary'} onClick={() => navigate('/claims')}>
                        {t('Отмена')}
                    </Button>
                </Flex>
            </Form>

        </>
    )
        ;
};

export default Index;
