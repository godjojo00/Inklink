import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, MailOutlined, MobileOutlined } from '@ant-design/icons';
import './login.css';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const SignUp_Page = () => {
  let navigate = useNavigate();
  const [form] = Form.useForm();

  async function onFinish(values) {
    console.log('Received values of form: ', values);

    try {
      const { username, phone_number, email, password } = values;

      // 使用上述数据进行注册

      // 注册成功后的处理，例如重定向到登录页
      (() => {
        notification['success']({
          message: "Registered Successfully!",
          description: "You will be redirected to Login Page after 3 seconds.",
          placement: "topLeft",
          duration: 2.2
        })
      })();

      setTimeout(() => {
        navigate.push("/login");
      }, 5173);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="signUp_title">Sign Up</h1>
        <div className="signUp_page">
          <Form
            // {...formItemLayout}
            form={form}
            onFinish={(values) => onFinish(values)}
            scrollToFirstError
            labelAlign="left"
          >
            <Form.Item
              labelCol={{ xs: 45, sm: 30 }}
              wrapperCol={{ xs: 25, sm: 30 }}
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
              labelCol={{ xs: 45, sm: 30 }}
              wrapperCol={{ xs: 25, sm: 30 }}
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
              labelCol={{ xs: 45, sm: 30 }}
              wrapperCol={{ xs: 25, sm: 30 }}
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
              labelCol={{ xs: 45, sm: 30 }}
              wrapperCol={{ xs: 25, sm: 30 }}
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
            <Form.Item
              // {...tailFormItemLayout}
            >
              <Button type="primary" htmlType="submit" className="wide-form-button">
                Sign Up
              </Button>
              <div className="signup-text">
                Already have an Account? <a href="/login">Login</a>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>

    </div>
  );
};

export default SignUp_Page;
