import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { callApi } from '../utils/axios_client';
import { useUser } from '../Usercontext';

const Login_Page = ({ onLogin }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const { updateUser } = useUser();

  const handleLogin = async () => {
    try {
      const res = await callApi('http://localhost:8000/users/login', 'post', {
        username: userName,
        password: password,
      });

      console.log(res);

      if (res.status === 200) {
        if (res.data.login === "failed") {
          console.log(res);
          message.error('Your username or password is wrong!');
        } else {
          onLogin({
            username: userName,
            user_id: res.data.user_id,
          });
          message.success('Login successfully!');
          // const userData = res.data; // 这一行似乎多余
          updateUser({ username: userName, userId: res.data.user_id }); // 修复此行代码
          // 自动跳转到 Home page
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      }
    } catch (error) {
      console.log(error);

      if (userName === '' || password === '') {
        message.error('Username or password cannot be empty!');
      } else {
        message.error('Your username or password is wrong!');
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-6 text-center">Login</h1>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your Username!',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              value={userName}
              placeholder="Username"
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleLogin()}
            >
              Login
            </Button>
            <div className="mt-4 text-center">
              Don't have an Account? <Link to="/signUp" className="text-blue-600">Sign Up</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login_Page;
