import {request} from "../../services/api";
import {useQuery} from "@tanstack/react-query";

const usePaginateQuery = ({
                              key = "get-all",
                              url = "/",
                              page = 1,
                              limit = 10,
                              params = {},
                              showSuccessMsg = false,
                              showErrorMsg = false
                          }) => {

    const {
        isLoading,
        isError,
        data,
        error,
        isFetching,
        ...rest
    } = useQuery([key, page], () => request.get(`${url}?page=${page}&limit=${limit}`, params), {
        keepPreviousData: true,
        onSuccess: () => {
            if (showSuccessMsg) {
                // toast.success('SUCCESS')
            }
        },
        onError: (data) => {
            if (showErrorMsg) {
                // toast.error(data?.response?.data?.message || `ERROR`)
            }
        }
    });

    return {
        isLoading,
        isError,
        data,
        error,
        isFetching,
        ...rest
    }
};

export default usePaginateQuery;
