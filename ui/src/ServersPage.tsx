import React, { useReducer, useState } from 'react';
import { Button, Col, Row, Statistic } from 'antd';
import {
  RedoOutlined,
} from '@ant-design/icons';
import Axios from 'axios';
import Search from 'antd/lib/input/Search';

type Loader = 'start' | 'status' | 'shut down';

interface State {
  readonly loading: boolean;
  readonly online?: boolean;
  readonly loader?: Loader;
  readonly serversOnline?: number;
}

type Action =
  | { type: 'loading', loader?: Loader }
  | { type: 'status', online?: boolean, serversOnline?: number };

function isLoader(loader: Loader, state: State): boolean {
  return state.loading && loader === state.loader;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        loading: true,
        loader: action.loader,
      };
    case 'status':
      return {
        ...state,
        loading: false,
        online: action.online,
        serversOnline: action.serversOnline,
      };
  }
}

export const ServersPage = () => {
  const [servers, setServers] = useState<string>('')
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const onCheckStatus = async () => {
    try {
      dispatch({ type: 'loading', loader: 'status' });
      const result = await Axios.get('/api/status');
      const response = result.data;
      dispatch({
        type: 'status',
        online: response.data.running,
        serversOnline: response.data.servers,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'status' });
    }
  };

  const onStartServer = async () => {
    try {
      dispatch({ type: 'loading', loader: 'start' });
      const result = await Axios.post('/api/start');
      const response = result.data;
      dispatch({
        type: 'status',
        online: response.data.running,
        serversOnline: response.data.servers,
      });
    } catch (error) {
      console.error('error');
      dispatch({ type: 'status' });
    }
  };

  const onShutdownServer = async () => {
    try {
      dispatch({ type: 'loading', loader: 'shut down' });
      await Axios.post('/api/shutdown');
      dispatch({
        type: 'status',
        online: false,
        serversOnline: 0,
      });
    } catch (error) {
      console.error('error');
      dispatch({ type: 'status' });
    }
  };

  const onResizeServer = async () => {
    const serverCount = parseInt(servers);

    try {
      dispatch({ type: 'loading' });
      const result = await Axios.post('/api/resize', serverCount);
      console.log('result', result);
      dispatch({
        type: 'status',
        online: true,
        serversOnline: result.data.data.servers,
      });
    } catch (error) {
      console.error('error');
      dispatch({ type: 'status' });
    }
  };

  const serversOnline = state.serversOnline !== undefined ? state.serversOnline : '?';

  const status = state.online === undefined ? '?' : (state.online ? 'Online' : 'Offline');

  return (
    <>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Status" value={status} />
          </Col>
          <Col span={12}>
            <Statistic title="Servers Running" value={serversOnline} />
            <Button
              shape="circle"
              size="large"
              loading={isLoader('status', state)}
              icon={<RedoOutlined />}
              onClick={onCheckStatus}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={5}>
            <Button
              type="primary"
              loading={isLoader('start', state)}
              onClick={onStartServer}
            >
              {isLoader('start', state) ? 'Starting server...' : 'Start server'}
            </Button>
          </Col>
          <Col span={6}>
            <Search
              placeholder="Servers to add"
              onSearch={onResizeServer}
              onChange={event => setServers(event.currentTarget.value)}
              enterButton="Resize"
              value={servers}
            />
          </Col>
          <Col span={5}>
            <Button
              type="primary"
              loading={isLoader('shut down', state)}
              onClick={onShutdownServer}
            >
              {isLoader('shut down', state) ? 'Shutting down server...' : 'Shutdown server'}
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
};
