import {request} from "../../services/api";
import {useQuery} from "@tanstack/react-query";

const useGetAllQuery = ({
                            key = "get-all",
                            url = "/",
                            params = {},
                            hideErrorMsg = false,
                            enabled = true,
                            cb = {
                                success: () => {
                                },
                                fail: () => {
                                }
                            },
                        }) => {

    const {isLoading, isError, data, error, isFetching,refetch,...rest} = useQuery({
        queryKey:[key, params],
        queryFn:() => request.get(url, params),
        onSuccess: ({data}) => {
            cb?.success(data)
        },
            onError: (data) => {
            cb?.fail()
            if (!hideErrorMsg) {
                // toast.error(data?.response?.data?.message || `ERROR!!! ${url} api not working`)
            }
        },
            enabled

    });

    return {
        isLoading,
        isError,
        data,
        error,
        isFetching,
        refetch,
        ...rest
    }
};

export default useGetAllQuery;
