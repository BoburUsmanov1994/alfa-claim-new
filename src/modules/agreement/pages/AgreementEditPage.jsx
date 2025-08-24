import React, {useEffect, useState} from 'react';
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
import VehicleDamage from "../components/vehicle-damage";
import PropertyDamage from "../components/property-damage";
import LifeDamage from "../components/life-damage";
import HealthDamage from "../components/health-damage";
import FileForm from "../components/file-form";
import EventForm from "../components/event-form";
import ApplicantForm from "../components/applicant-form";


const AgreementEditPage = () => {
    const {id} = useParams();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [formLifeDamage] = Form.useForm();
    const [formHealthDamage] = Form.useForm();
    const {user} = useAuth()
    const {mutate, isPending} = usePostQuery({})
    const {mutate: patchRequest, isPending: isPendingPatch} = usePutQuery({})
    const {mutate: deleteRequest, isPending: isPendingDelete} = useDeleteQuery({})
    const {applicant, client, eventCircumstances} = Form.useWatch([], form) || {}
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [lifeDamage, setLifeDamage] = useState([]);
    const [healthDamage, setHealthDamage] = useState([]);
    const [vehicleDamage, setVehicleDamage] = useState([]);
    const [otherPropertyDamage, setOtherPropertyDamage] = useState([]);
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

    let {data: ownershipForms, isLoading: isLoadingOwnershipForms} = useGetAllQuery({
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


    const onFinish = ({client, eventCircumstances, ...rest}) => {
        patchRequest({
            url: URLS.claimEdit,
            attributes: {
                id,
                ...rest,
                eventCircumstances: {
                    ...eventCircumstances,
                    countryId: String(get(eventCircumstances, 'countryId'))
                },
                photoVideoMaterials: files?.map(({_id,file, url}) => ({file: _id ?? file, url})),
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
        if (!isEmpty(get(data, 'data.result.photoVideoMaterials', []))) {
            setFiles(get(data, 'data.result.photoVideoMaterials', []))
        }
        if (!isEmpty(get(data, 'data.result.lifeDamage', []))) {
            setLifeDamage(get(data, 'data.result.lifeDamage', []))
        }
        if (!isEmpty(get(data, 'data.result.healthDamage', []))) {
            setHealthDamage(get(data, 'data.result.healthDamage', []))
        }
        if (!isEmpty(get(data, 'data.result.vehicleDamage', []))) {
            setVehicleDamage(get(data, 'data.result.vehicleDamage', []))
        }
        if (!isEmpty(get(data, 'data.result.otherPropertyDamage', []))) {
            setOtherPropertyDamage(get(data, 'data.result.otherPropertyDamage', []))
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
            <Spin spinning={isPending || isPendingPatch}>
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
                    <Card className={'mb-4'} title={t('Данные о Заявителе:')} bordered>
                        <ApplicantForm
                            client={client}
                            applicant={applicant}
                            isPending={isPending}
                            countryList={countryList}
                            regions={regions}
                            getOrgInfo={getOrgInfo}
                            getPersonInfo={getPersonInfo}
                            residentTypes={residentTypes}
                            ownershipForms={ownershipForms}
                        />

                    </Card>
                    <Card className={'mb-4'} title={t('Обстоятельства события:')} bordered>
                        <EventForm eventCircumstances={eventCircumstances} regions={regions} countryList={countryList}/>
                    </Card>
                    <FileForm setFiles={setFiles} files={files}/>


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


        </>

    );
};

export default AgreementEditPage;
