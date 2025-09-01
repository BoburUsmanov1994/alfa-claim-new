import React, {useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Button, Card,
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
import {useNavigate} from "react-router-dom";
import MaskedInput from "../../../components/masked-input";
import {useDeleteQuery, useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {find, get, isEqual, toUpper} from "lodash";
import dayjs from "dayjs";
import {PlusOutlined, ReloadOutlined, InboxOutlined, DeleteOutlined} from "@ant-design/icons";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import useAuth from "../../../hooks/auth/useAuth";
import {request} from "../../../services/api";
import ApplicantForm from "../components/applicant-form";
import EventForm from "../components/event-form";
import FileForm from "../components/file-form";



const AgreementCreatePage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const {user} = useAuth()
    const {mutate, isPending} = usePostQuery({})
    const {applicant, client, eventCircumstances} = Form.useWatch([], form) || {}
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const submitType = useRef(null);

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

    let {data: areaTypes} = useGetAllQuery({
        key: KEYS.areaTypes,
        url: `${URLS.areaTypes}`,
    });
    areaTypes = getSelectOptionsListFromData(get(areaTypes, `data.result`, []), 'id', 'name')
    let {data: ownershipForms, isLoading: isLoadingOwnershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms,
        url: URLS.ownershipForms,
    });
    ownershipForms = getSelectOptionsListFromData(get(ownershipForms, `data.result`, []), 'id', 'name')

    const getPersonInfo = (type=['applicant', 'person'],_form=form) => {
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
                form.setFieldValue([...type, 'address'], get(result, 'address'))
                _form.setFieldValue([...type, 'passportData', 'givenPlace'], get(find(get(result, 'documents', []), _item => isEqual(get(_item, 'document'), `${toUpper(_form.getFieldValue([...type, 'passportData', 'seria']))}${_form.getFieldValue([...type, 'passportData', 'number'])}`)), 'docgiveplace'))
                _form.setFieldValue([...type, 'passportData', 'issueDate'], dayjs(get(find(get(result, 'documents', []), _item => isEqual(get(_item, 'document'), `${toUpper(_form.getFieldValue([...type, 'passportData', 'seria']))}${_form.getFieldValue([...type, 'passportData', 'number'])}`)), 'datebegin')))
            }
        })
    }

    const getOrgInfo = (type=['applicant', 'organization'],_form=form) => {
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


    const onFinish = ({client, eventCircumstances, ...rest}) => {
        if (submitType.current) {
            mutate({
                url: URLS.claimCreate,
                attributes: {
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
        } else {
            mutate({
                url: URLS.claimDraft,
                attributes: {
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
        }
    };

    if (isLoadingCountry || isLoadingResident || isLoadingRegion || isLoadingOwnershipForms) {
        return <Spin spinning fullscreen/>
    }

    return (
        <>
            <PageHeader
                title={t('Добавление заявление')}
            />
            <Spin spinning={isPending}>
                <Form
                    name="claim"
                    form={form}
                    layout="vertical"
                    initialValues={{
                        client: get(user, 'pin') ? 'person' : 'organization',
                    }}
                    onFinish={onFinish}
                >
                    <Card className={'mb-4'} bordered title={t('Данные о Заявителе:')}>
                       <ApplicantForm applicant={applicant} client={client} regions={regions} getOrgInfo={getOrgInfo} isPending={isPending} countryList={countryList} residentTypes={residentTypes} getPersonInfo={getPersonInfo} ownershipForms={ownershipForms} />
                    </Card>

                    <Card className={'mb-4'} title={t('Обстоятельства события:')} bordered>
                        <EventForm areaTypes={areaTypes} eventCircumstances={eventCircumstances} countryList={countryList} regions={regions} />
                    </Card>
                    <FileForm setFiles={setFiles} files={files} />

                    <Flex className={'mt-6'}>
                        <Button onClick={() => (submitType.current = false)} type="default" htmlType={'submit'}
                                name={'draft'}>
                            {t('Сохранить как черновик')}
                        </Button>
                        <Button onClick={() => (submitType.current = true)} className={'mx-3'} type="primary"
                                htmlType={'submit'} name={'save'}>
                            {t('Подать заявление')}
                        </Button>
                        <Button danger type={'primary'} onClick={() => navigate('/claims')}>
                            {t('Отменить')}
                        </Button>
                    </Flex>
                </Form>
            </Spin>

        </>

    );
};

export default AgreementCreatePage;
