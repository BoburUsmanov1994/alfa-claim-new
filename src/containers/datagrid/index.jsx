import React, {useState} from 'react';
import {ProTable} from '@ant-design/pro-components';
import {useRef} from 'react';
import {get} from "lodash";
import {request} from "../../services/api";

const Index = ({
                   columns = [],
                   headerTitle = '',
                   params = {},
                   url = '',
                   axios = request,
                   rowKey = "_id",
                   success = true,
                   responseListKeyName = 'data',
                   responseTotalKeyName = 'count',
                   children,
                   formRef = null,
                   defaultCollapsed = false,
                   showSearch = true,
                   actionRef = null,
                   size = 20,
                   x = 1440,
                   rowSelection=false,
                   editable=false,
                   pagination = true
               }) => {
    const [pageSize, setPageSize] = useState(size)
    const ref = useRef();
    if (!actionRef) {
        actionRef = ref;
    }

    return (
        <>
            <ProTable
                style={{cursor: 'pointer'}}
                params={params}
                editable={editable}
                columns={[
                    {
                        title: '№',
                        dataIndex: 'index',
                        valueType: 'indexBorder',
                        render: (text, record, index, action) => {
                            return (action?.pageInfo?.current - 1) * action?.pageInfo?.pageSize + index + 1
                        },
                        width: 60,
                        hideInSearch: true
                    },
                    ...columns
                ]}
                formRef={formRef}
                rowSelection={rowSelection}
                actionRef={actionRef}
                cardBordered
                request={async (params, sorter, filter) => {
                    console.log(params, sorter, filter)
                    const {current, pageSize,...rest} = params;

                    const {data} = await axios.get(url, {
                        params: {
                            ...rest,
                            page: current,
                            limit: pageSize,
                        }
                    })
                    return {
                        data: get(data, responseListKeyName, []),
                        success: success,
                        total: get(data, responseTotalKeyName, 0)
                    }
                }}
                headerTitle={headerTitle}
                pagination={pagination ?{
                    pageSize,
                    onChange: (page, pageSize) => setPageSize(pageSize),
                    showQuickJumper: true,
                    showSizeChanger: true
                }:false}
                search={showSearch ? {
                    layout: 'vertical',
                    resetButtonProps: {
                        danger: true,
                    },
                    defaultCollapsed,
                } : false}
                rowKey={rowKey}
                toolBarRender={() => [children ? children({actionRef}) : <></>]}
                revalidateOnFocus
                scroll={{x, y: 800}}
                defaultSize={'small'}
            />
        </>
    );
};

export default Index;
