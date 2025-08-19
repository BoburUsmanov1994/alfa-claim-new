import React, {useState} from 'react';
import { Segmented, Tooltip} from "antd";
import {FullscreenExitOutlined, FullscreenOutlined, MoonOutlined, SunOutlined} from "@ant-design/icons"

const Index = () => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };
    return (
        <>
            <Tooltip title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <Segmented
                    defaultValue={isFullScreen}
                    size={'middle'}
                    shape="round"
                    options={[
                        { value: false, icon: <FullscreenExitOutlined /> },
                        { value: true, icon: <FullscreenOutlined /> },
                    ]}
                    onChange={toggleFullScreen}
                />
            </Tooltip>
        </>
    );
};

export default Index;
