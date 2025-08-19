import React, {useEffect, useState} from 'react';
import {
    Col,
    Row,
    Form,
    Select,
    Spin,
    Input,
    DatePicker,
    Divider,
    Typography,
    Table,
    Segmented,
    Button,
    Modal, notification, Switch
} from "antd";
import {useTranslation} from "react-i18next";
import {useGetAllQuery, usePostQuery} from "../../../../hooks/api";
import {KEYS} from "../../../../constants/key";
import {URLS} from "../../../../constants/url";
import {disablePastDates, getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";
import {useStore} from "../../../../store";
import {get, isEmpty, isEqual} from "lodash";
import FilePreview from "../../../../components/file-preview";
import {PERSON_TYPE} from "../../../../constants";
import MaskedInput from "../../../../components/masked-input";
import dayjs from "dayjs";
import {PlusOutlined} from "@ant-design/icons";

const StepOne = ({form}) => {
    const [product, setProduct] = useState(null);
    const [insurantType, setInsurantType] = useState(PERSON_TYPE.person);
    const [openInsurant, setOpenInsurant] = useState(false);
    const [insurant, setInsurant] = useState(null);
    const [pledgerType, setPledgerType] = useState(PERSON_TYPE.person);
    const [openPledger, setOpenPledger] = useState(false);
    const [pledger, setPledger] = useState(null);
    const [pledgers, setPledgers] = useState([]);
    const {t} = useTranslation();
    const [modalForm] = Form.useForm();
    const {user} = useStore()
    const group = Form.useWatch('group', form)
    const subGroup = Form.useWatch('subGroup', form)
    const isNbu = Form.useWatch('isNbu', modalForm)
    const {mutate: filterRequest, isPending: filterLoading} = usePostQuery({})
    let {data: branchList, isLoading} = useGetAllQuery({
        key: KEYS.branches,
        url: `${URLS.branches}/list`,
    })
    branchList = getSelectOptionsListFromData(get(branchList, `data.data`, []), '_id', 'branchName')
    let {data: groups} = useGetAllQuery({
        key: KEYS.groupsofproducts,
        url: `${URLS.groupsofproducts}/list`,
    })
    const groupsList = getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')

    let {data: subGroups} = useGetAllQuery({
        key: KEYS.subgroupsofproductsFilter,
        url: URLS.subgroupsofproductsFilter,
        params: {
            params: {
                group
            }
        },
        enabled: !!group
    })
    let subGroupList = getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name')

    let {data: productsList} = useGetAllQuery({
        key: [KEYS.productsfilter, subGroup],
        url: URLS.products,
        params: {
            params: {
                subGroup: subGroup
            }
        },
        enabled: !!subGroup
    })

    let products = getSelectOptionsListFromData(
        get(productsList, `data.data`, []),
        "_id",
        ["name"]
    );
    let { data: clientList } = useGetAllQuery({ key: KEYS.agents, url: `${URLS.clients}/list?isNbu=true&limit=200&type=ORGANIZATION` })
    let clients = getSelectOptionsListFromData(get(clientList, `data.data`, []), '_id', ['organization.name'])
    const handleOk = async (type) => {
        try {
            const values = await modalForm.validateFields();
            const {person,isNbu,...rest} = values;
            findPerson({person:person?{...person,birthDate:dayjs(get(person,'birthDate')).format('YYYY-MM-DD')}:undefined,...rest,type},(response)=>{
                setOpenInsurant(false);
                modalForm.resetFields();
                setInsurant(response)
                form.setFieldValue('insurant',response?._id);
            })
        } catch (error) {
            notification['error']({
                message:  'Ошибка'
            })
        }
    };
    const handleOkPledger = async (type) => {
        try {
            const values = await modalForm.validateFields();
            const {person,...rest} = values;
            findPerson({person:person?{...person,birthDate:dayjs(get(person,'birthDate')).format('YYYY-MM-DD')}:undefined,...rest,type},(response)=>{
                setOpenPledger(false);
                modalForm.resetFields();
                setPledger(response)
            })
        } catch (error) {
            notification['error']({
                message:  'Ошибка'
            })
        }
    };
    const findPerson = (_attrs,cb=()=>{}) => {
        filterRequest({
            url: URLS.findOrCreateClient,
            attributes:{
                ..._attrs,
            }
        },{
            onSuccess:({data:response})=>{
                cb(response)
            }
        })
    }
    useEffect(() => {
        if (!isEmpty(branchList)) {
            form.setFieldValue('branch', get(user, 'branch._id'));
        }
    }, [branchList, user])
    if (isLoading) {
        return <Spin spinning={isLoading}/>;
    }

    return (
        <>
            <Row gutter={16}>
                <Col xs={6}>
                    <Form.Item name={'branch'} label={t('Филиал')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Select disabled options={branchList}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'agreementNumber'} label={t('Agreement number')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'group'} label={t('Выберите категорию')}>
                        <Select allowClear showSearch options={groupsList} placeholder={t('Выбирать')}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'subGroup'} label={t('Выберите подкатегорию')}>
                        <Select allowClear showSearch options={subGroupList} placeholder={t('Выбирать')}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'product'} label={t('Выберите продукта')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Select onChange={(_, option) => setProduct(get(option, 'option'))} allowClear showSearch
                                options={products} placeholder={t('Выбирать')}/>
                    </Form.Item>
                </Col>
                <Col xs={4}>
                    <Form.Item name={'agreementDate'} label={t('Agreement date')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <DatePicker className={'w-full'} disabledDate={disablePastDates}/>
                    </Form.Item>
                </Col>
                <Col xs={4}>
                    <Form.Item name={'startOfInsurance'} label={t('Начало страхового покрытия')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <DatePicker className={'w-full'} disabledDate={disablePastDates}/>
                    </Form.Item>
                </Col>
                <Col xs={4}>
                    <Form.Item name={'endOfInsurance'} label={t('Окончание страхового покрытия')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <DatePicker className={'w-full'} disabledDate={disablePastDates}/>
                    </Form.Item>
                </Col>
                <Col span={24} className={'mb-4'}>
                    {product && (get(product, 'applicationForm._id') || get(product, 'contractForm._id') || get(product, 'additionalDocuments._id')) && <>
                        <Divider orientation={'left'}>
                            <Typography.Title level={4}>{t('Шаблоны')}</Typography.Title>
                        </Divider>
                        <Row gutter={16}>
                            <Col span={8}>
                                {get(product, 'applicationForm._id') && <><span
                                    className={'mr-2.5'}>{t('Форма анкеты')}</span><FilePreview
                                    fileId={get(product, 'applicationForm._id')}/></>}
                            </Col>
                            <Col span={8}>
                                {get(product, 'contractForm._id') && <><span
                                    className={'mr-2.5'}>{t('Договор')}</span><FilePreview
                                    fileId={get(product, 'contractForm._id')}/></>}
                            </Col>
                            <Col span={8}>
                                {get(product, 'additionalDocuments._id') && <><span
                                    className={'mr-2.5'}>{t('Приложения')}</span><FilePreview
                                    fileId={get(product, 'additionalDocuments._id')}/></>}
                            </Col>
                        </Row>
                    </>}
                    {get(product, 'risk', [])?.length > 0 && <><Divider orientation={'left'}>
                        <Typography.Title level={4}>{t('Покрываемые риски')}</Typography.Title>
                    </Divider>
                        <Table
                            pagination={false}
                            dataSource={get(product, 'risk', [])}
                            columns={[
                                {
                                    dataIndex: 'riskType',
                                    title: t('Тип риска'),
                                    render: (value) => get(value, 'name'),
                                },
                                {
                                    dataIndex: 'name',
                                    title: t('Риск'),
                                },
                                {
                                    dataIndex: 'insuranceClass',
                                    title: t('Класс страхования'),
                                    render: (value) => get(value, 'name'),
                                }
                            ]}
                        /></>}
                </Col>
                <Col span={24}>
                    <Divider orientation={'left'}> <Typography.Title
                        level={4}>{t('Страхователь')}</Typography.Title></Divider>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Segmented
                                value={insurantType}
                                options={[{
                                    value: PERSON_TYPE.person,
                                    label: t('Физическое лицо')
                                }, {value: PERSON_TYPE.organization, label: t('Юридическое лицо')}]}
                                onChange={value => {
                                    setInsurantType(value)
                                }}
                            />
                        </Col>
                        <Col span={8}>
                            <Form.Item name={'insurant'} label={null}
                                       getValueProps={() => ({
                                           value: insurant?.person ? `${insurant?.person?.fullName?.lastname} ${insurant?.person?.fullName?.firstname}  ${insurant?.person?.fullName?.middlename}`:insurant?.organization ? insurant?.organization?.name:'',
                                       })}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Button onClick={() => setOpenInsurant(true)}>{t('Выбрать')}</Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Divider orientation={'left'}> <Typography.Title
                        level={4}>{t('Залогодатель')}</Typography.Title></Divider>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Segmented
                                value={pledgerType}
                                options={[{
                                    value: PERSON_TYPE.person,
                                    label: t('Физическое лицо')
                                }, {value: PERSON_TYPE.organization, label: t('Юридическое лицо')}]}
                                onChange={value => {
                                    setPledgerType(value)
                                }}
                            />
                        </Col>
                        <Col span={8}>
                            <Form.Item name={'pledger'} label={null}
                                       getValueProps={() => ({
                                           value: pledger?.person ? `${pledger?.person?.fullName?.lastname} ${pledger?.person?.fullName?.firstname}  ${pledger?.person?.fullName?.middlename}`:pledger?.organization ? pledger?.organization?.name:'',
                                       })}
                                       >
                                <Input disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Button onClick={() => setOpenPledger(true)}>{t('Выбрать')}</Button>
                            <Button icon={<PlusOutlined />} className={'ml-3'} onClick={() => {
                                setPledgers(prev=>[...prev,pledger])
                                form.setFieldValue('pledgers', [...form.getFieldValue('pledgers'),get(pledger,'_id')]);
                            }}>{t('Добавить')}</Button>
                        </Col>
                    </Row>
                    <Table
                        pagination={false}
                        dataSource={pledgers}
                        columns={[
                            {
                                dataIndex: 'riskType',
                                title: t('Тип'),
                                render: (value) => get(value, 'name'),
                            },
                            {
                                dataIndex: 'name',
                                title: t('Полное имя'),
                            },
                        ]}
                    />
                </Col>
            </Row>
            <Modal
                loading={filterLoading}
                width={600}
                title={t('Выберите тип страхователя')}
                open={openInsurant}
                onOk={()=>handleOk(insurantType)}
                onCancel={() => setOpenInsurant(false)}
            >
                <Form form={modalForm} layout="vertical">
                    {isEqual(insurantType,PERSON_TYPE.person) ? <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t("Passport seria")}
                                name={['person', 'seria']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label={t("Passport number")}
                                name={['person', 'number']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'9999999'} className={'uppercase'} placeholder={'_______'}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t("Birthdate")}
                                name={['person', 'birthDate']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <DatePicker format={"DD-MM-YYYY"}  className={'w-full'} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label={t("Телефон")}
                                name={['person', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                            </Form.Item>
                        </Col>
                    </Row>:<Row gutter={16}>
                        <Col span={9}>
                            <Form.Item
                                label={t("ИНН")}
                                name={['organization', 'inn']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'999999999'} className={'uppercase'} placeholder={'_________'}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Is NBU")}
                                name={'isNbu'}
                                valuePropName="checked"
                                initialValue={false}
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        {
                            isNbu &&  <Col span={9}>
                                <Form.Item
                                    label={t("Clients")}
                                >
                                    <Select onChange={(_id,{option})=>{
                                        form.setFieldValue('insurant',_id);
                                        setOpenInsurant(false);
                                        setInsurant(option)
                                    }} allowClear showSearch  options={clients} />
                                </Form.Item>
                            </Col>
                        }

                    </Row>}
                </Form>
            </Modal>
            <Modal
                loading={filterLoading}
                width={600}
                title={t('Выберите залогодатель')}
                open={openPledger}
                onOk={()=>handleOkPledger(pledgerType)}
                onCancel={() => setOpenPledger(false)}
            >
                <Form form={modalForm} layout="vertical">
                    {isEqual(pledgerType,PERSON_TYPE.person) ? <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label={t("Passport seria")}
                                name={['person', 'seria']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'aa'} className={'uppercase'} placeholder={'__'}/>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label={t("Passport number")}
                                name={['person', 'number']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'9999999'} className={'uppercase'} placeholder={'_______'}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label={t("Birthdate")}
                                name={['person', 'birthDate']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <DatePicker format={"DD-MM-YYYY"}  className={'w-full'} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label={t("Телефон")}
                                name={['person', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                            </Form.Item>
                        </Col>
                    </Row>:<Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                label={t("ИНН")}
                                name={['organization', 'inn']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'999999999'} className={'uppercase'} placeholder={'_________'}/>
                            </Form.Item>
                        </Col>

                    </Row>}
                </Form>
            </Modal>
        </>
    );
};

export default StepOne;
