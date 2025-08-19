import React,{useState,useEffect} from 'react';
import config from "../../config";
import {get} from "lodash";
import {DownloadOutlined} from "@ant-design/icons";
import {request} from "../../services/api";
import {URLS} from "../../constants/url";

const Index = ({fileId}) => {
    const [url,setUrl] = useState('')
    const getDownloadURL = async (_fileId) => {
        return await request.get(`${URLS.showFile}/${_fileId}`)
    }

    useEffect(() => {
        if(fileId) {
            getDownloadURL(fileId).then((res) => {
                setUrl(get(res, 'data.path', '#'))
            })
        }
    }, []);
    return (
        <>{url ? <a target={"_blank"}
           href={`${config.FILE_URL}/${url}`}><DownloadOutlined
            className={'cursor-pointer mr-8'}
            color={'#13D6D1'}/></a>:'-' }</>
    );
};

export default Index;
