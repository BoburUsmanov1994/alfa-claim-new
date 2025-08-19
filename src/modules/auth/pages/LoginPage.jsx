import React, {useState} from 'react';
import {Button, Card, Descriptions, Drawer, Flex, Radio, Result, Space, Spin} from "antd";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../../services/auth/auth";
import useEimzo from "../../../hooks/eimzo/useEimzo";
import {isEmpty, isEqual, get} from "lodash";
import dayjs from "dayjs";
import {UserOutlined} from "@ant-design/icons"
import clsx from "clsx";
import {usePostQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {request} from "../../../services/api";
import {useSettingsStore} from "../../../store";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const {setToken} = useSettingsStore()
    const {login, isLoading} = useAuth()
    const {mutate, isPending} = usePostQuery({})
    const {
        loading, setLoading = () => {
        }, keys, error, sign, initEIMZO
    } = useEimzo();


    const onFinish = (data) => {
        login(data)
    }

    const loginByEimzo = async (_key) => {
        const challenge = await request.get("api/eimzo/challenge").then((res) => res);
        await sign(_key, get(challenge, 'data.result.challenge'), (data, error) => {
            if (!error) {
                const {pkcs7_64 = null, signature_hex = "", signer_serial_number = ""} = data;
                mutate(
                    {
                        url: URLS.eimzoLogin,
                        attributes: {
                            pkcs7Data: pkcs7_64,
                        },
                    },
                    {
                        onSuccess: (data) => {
                            setToken(get(data, "data.result.access_token"))
                            navigate('/claims');

                        },
                        onError: () => {
                            setLoading(false)
                        }
                    }
                );
            }
        });
    }
    return (
        <>
            <Spin spinning={isLoading || isPending}>
                <h2 className={' text-xl mb-6 text-center font-semibold mt-4'}>{t("Тип авторизации")}</h2>
                <Radio.Group
                    disabled
                    className={'mb-6'}
                    value={1}
                    options={[{
                        value: 1,
                        label: t('Электронно-цифровая подпись')
                    },
                        {
                            value: 2,
                            label: 'OneID'
                        }]}
                />
                <Button block type="primary" className={'font-medium'} onClick={() => setOpen(true)}>
                    {t('Авторизоваться')}
                </Button>
            </Spin>
            <Drawer placement={'left'} title={t('Выберите ЭЦП')} open={open} onClose={() => setOpen(false)} width={450}>
                <Spin spinning={loading}>
                    {error && isEqual(error, 'NOT_INSTALLED') ? (<Result
                        status="warning"
                        title={t("Установите модуль E-IMZO от имени Администратора.")}
                        subTitle={t("Для корректной работы системы необходимо установить модуль E-IMZO")}
                        extra={<Flex>
                            <Button type="primary"
                                    onClick={() => window.open("https://e-imzo.uz/main/downloads/", "_blank")}>
                                {t("Скачать ПО E-IMZO")}
                            </Button>
                            <Button type="primary" danger onClick={() => initEIMZO()} className={'ml-3'}>
                                {t("Перезагрузить E-IMZO")}
                            </Button>
                        </Flex>
                        }
                    />) : isEmpty(keys) ? (<Result
                        status="warning"
                        title={t("Ключ(и) E-IMZO не найден(ы)")}
                        subTitle={t('Если у вас ОС Windows проверьти папку C:\\\\DSKEYS если у вас еше нет ключа то вы можете получить его по ссылке ниже:')}
                        extra={<Flex>
                            <Button type="primary"
                                    onClick={() => window.open("https://e-imzo.uz/#how_to_get", "_blank")}>
                                {t("Получить E-IMZO")}
                            </Button>
                            <Button type="primary" danger onClick={() => initEIMZO()} className={'ml-3'}>
                                {t("Перезагрузить E-IMZO")}
                            </Button>
                        </Flex>
                        }
                    />) : <Space direction="vertical" size={16}>
                        {
                            keys?.map(_key => {
                                return (<Card className={clsx({'bg-red-300': !dayjs().isBefore(get(_key, "validTo"))})}
                                              key={get(_key, 'name')} hoverable={dayjs().isBefore(get(_key, "validTo"))}
                                              type="inner" size="small"
                                              title={<Flex><UserOutlined className={'mr-1.5'}/> {get(_key, "CN")}
                                              </Flex>} style={{width: 400}}
                                              onClick={() => dayjs().isBefore(get(_key, "validTo")) ? loginByEimzo(_key) : null}>
                                    <Descriptions title={null}>
                                        <Descriptions.Item label={t("ИНН")}
                                                           span={24}>{get(_key, 'TIN')}</Descriptions.Item>
                                        <Descriptions.Item label={t("ПИНФЛ")}
                                                           span={24}>{get(_key, 'PINFL')}</Descriptions.Item>
                                        <Descriptions.Item label={t("ПЕРИОД")}
                                                           span={24}>{dayjs(get(_key, 'validFrom')).format("DD-MM-YYYY")} / {dayjs(get(_key, 'validTo')).format("DD-MM-YYYY")}</Descriptions.Item>
                                    </Descriptions>
                                </Card>)
                            })
                        }
                    </Space>}
                </Spin>
            </Drawer>
        </>
    );
};

export default LoginPage;
