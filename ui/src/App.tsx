import React, { FunctionComponent, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { ServersPage } from './ServersPage';
import { DataPage } from './DataPage';
import './App.css';

const { Content, Sider } = Layout;

const App = () => {
  const [key, setKey] = useState<string>('servers');

  let MenuContent: FunctionComponent;
  if (key === 'servers') {
    MenuContent = ServersPage;
  } else {
    MenuContent = DataPage;
  }

  return (
    <div className="App">
      <Layout style={{ minHeight: '100vh' }}>
        <Sider theme="light">
          <div className="logo" />
          <Menu onClick={event => setKey(event.key.toString())} defaultSelectedKeys={[key]} mode="inline">
            <Menu.Item key="servers" icon={<PieChartOutlined />}>
              Servers
            </Menu.Item>
            <Menu.Item key="data" icon={<DesktopOutlined />}>
              Data
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Content style={{ margin: '0 16px' }}>
            <MenuContent />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;