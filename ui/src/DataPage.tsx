import React from 'react';
import { Upload } from 'antd';
import {
  InboxOutlined,
} from '@ant-design/icons';

const { Dragger } = Upload;

export const DataPage = () => {
  return (
    <>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
        <Dragger multiple action="/api/inject">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Supported formats are ...
          </p>
        </Dragger>
      </div>
    </>
  );
};
