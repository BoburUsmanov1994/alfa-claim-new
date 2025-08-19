import {request} from "../../services/api";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {notification} from "antd";

const deleteRequest = (url) => request.delete(url);

const useDeleteQuery = ({listKeyId = null}) => {


        const queryClient = useQueryClient();

        const {mutate, isLoading, isError, error, isFetching, isPending} = useMutation({
            mutationFn: ({
                          url
                      }) => deleteRequest(url),

            onSuccess: (data) => {
                notification['success']({
                    message: data?.data?.message || 'Успешно'
                })

                if (listKeyId) {
                    queryClient.invalidateQueries(listKeyId)
                }
            },
            onError: (data) => {
                notification['error']({
                    message: data?.response?.data?.message || 'Ошибка'
                })
            }

        });

        return {
            mutate,
            isLoading,
            isPending,
            isError,
            error,
            isFetching
        }
    }
;

export default useDeleteQuery;
