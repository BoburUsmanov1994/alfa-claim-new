import {request} from "../../services/api";
import {forEach, isArray} from "lodash";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {notification} from "antd";

const putRequest = (url, attributes) => request.patch(url, attributes);

const usePutQuery = ({hideSuccessToast = false, listKeyId = null}) => {


        const queryClient = useQueryClient();

        const {mutate, isLoading, isError, error, isFetching, isPending} = useMutation({
                mutationFn: ({
                                 url, attributes
                             }) => putRequest(url, attributes),

                onSuccess: (data) => {
                    if (!hideSuccessToast) {
                        notification['success']({
                            message: data?.data?.message || 'Успешно'
                        })
                    }

                    if (listKeyId) {
                        queryClient.invalidateQueries(listKeyId)
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
            isLoading,
            isError,
            error,
            isFetching,
            isPending
        }
    }
;

export default usePutQuery;
