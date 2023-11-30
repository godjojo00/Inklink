import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, MailOutlined, MobileOutlined } from '@ant-design/icons';
import { callApi } from '../utils/axios_client';

const SignUp_Page = () => {
  let navigate = useNavigate();
  const [form] = Form.useForm();

  async function onFinish(values) {
    console.log('Received values of form: ', values);

    try {
      const { username, phone_number, email, password } = values;

      // 使用上述数据进行注册
      const response = await callApi('http://localhost:8000/users/', 'post', {
        username,
        phone_number,
        email,
        password,
      });
      // 注册成功后的处理，例如重定向到登录页
      if (response.status === 201) {
        notification['success']({
          message: 'Registered Successfully!',
          description: 'You will be redirected to Login Page after 3 seconds.',
          placement: 'topLeft',
          duration: 2.2,
        });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        console.log(b)
        notification['error']({
          message: 'Registration Failed',
          description: 'Failed to register. Please try again.',
          placement: 'topLeft',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold mb-6">Sign Up</h1>
        <Form
          form={form}
          onFinish={(values) => onFinish(values)}
          scrollToFirstError
          labelAlign="left"
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
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="phone_number"
            rules={[
              {
                required: true,
                message: 'Please input phone number!',
              },
            ]}
          >
            <Input prefix={<MobileOutlined className="site-form-item-icon" />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ]}
          >
            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-blue-500">
              Sign Up
            </Button>
            <div className="mt-2 text-center">
              Already have an Account? <a href="/login" className="text-blue-500">Login</a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignUp_Page;
