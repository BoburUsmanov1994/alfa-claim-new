import {request} from "../../services/api";
import {forEach, isArray} from "lodash";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {notification} from 'antd';

const postRequest = (url, attributes, config = {}) => request.post(url, attributes, config);

const usePostQuery = ({hideSuccessToast = false, listKeyId = null}) => {


        const queryClient = useQueryClient();

        const {mutate, isLoading, isError, error, isFetching,isPending} = useMutation(
            {
                mutationFn: ({
                                 url,
                                 attributes,
                                 config = {}
                             }) => postRequest(url, attributes, config),

                onSuccess: (data) => {
                    if (!hideSuccessToast) {
                        notification['success']({
                            message: data?.data?.message || 'Успешно'
                        })
                    }

                    if (listKeyId) {
                        if (isArray(listKeyId)) {
                            forEach(listKeyId, (_keyId) => {
                                queryClient.invalidateQueries(_keyId)
                            })
                        } else {
                            queryClient.invalidateQueries(listKeyId)
                        }
                    }
                },
                onError: (data) => {
                    if (isArray(data?.response?.data?.message)) {
                        forEach(data?.response?.data?.message, (_item) => {
                            notification['error']({
                                message: _item
                            })
                        })
                    } else {
                        notification['error']({
                            message: data?.response?.data?.message || data?.response?.data?.error || data?.response?.data?.message?.[0] || data?.message || 'Ошибка'
                        })
                    }

                }
            }
        );

        return {
            mutate,
            isPending,
            isError,
            error,
            isFetching
        }
    }
;

export default usePostQuery;
