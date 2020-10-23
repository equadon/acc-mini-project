import React, { useReducer } from 'react';
import { Button, Col, Row, Statistic } from 'antd';
import {
  RedoOutlined,
} from '@ant-design/icons';
import Axios from 'axios';

interface State {
  readonly serverLoading: boolean;
  readonly statusLoading: boolean;
  readonly status?: string;
  readonly serversOnline?: number;
}

type Action =
  | { type: 'start-server' }
  | { type: 'server-started' }
  | { type: 'check-status' }
  | { type: 'status', status?: string, serversOnline?: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start-server':
      return {
        ...state,
        serverLoading: true,
      };
    case 'server-started':
      return {
        ...state,
        serverLoading: false,
      };
    case 'check-status':
      return {
        ...state,
        statusLoading: true,
      };
    case 'status':
      return {
        ...state,
        statusLoading: false,
        status: action.status,
        serversOnline: action.serversOnline,
      };
  }
}

export const ServersPage = () => {
  const [state, dispatch] = useReducer(reducer, {
    serverLoading: false,
    statusLoading: false,
  });
  const onCheckStatus = async () => {
    try {
      dispatch({ type: 'check-status' });
      const result = await Axios.get('/api/status');
      const response = result.data;
      dispatch({
        type: 'status',
        status: response.data.success ? 'Online' : 'Offline',
        serversOnline: response.data.servers,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'status' });
    }
  };

  const onStartServer = async () => {
    try {
      dispatch({ type: 'start-server' });
      const result = await Axios.post('/api/start');
      console.log(result);
      dispatch({
        type: 'status',
        status: result.data.status === "success" ? 'Online' : 'Offline'
      });
      dispatch({ type: 'server-started' });
    } catch (error) {
      console.error('error');
      dispatch({ type: 'status' });
    }
  };

  const serversOnline = state.serversOnline !== undefined ? state.serversOnline : '?';

  return (
    <>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Status" value={state.status || '?'} />
          </Col>
          <Col span={12}>
            <Statistic title="Servers Running" value={serversOnline} />
            <Button
              shape="circle"
              size="large"
              loading={state.statusLoading}
              icon={<RedoOutlined />}
              onClick={onCheckStatus}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Button
            type="primary"
            loading={state.serverLoading}
            onClick={onStartServer}
          >
            {state.serverLoading ? 'Starting server...' : 'Start server'}
          </Button>
        </Row>
      </div>
    </>
  );
};
