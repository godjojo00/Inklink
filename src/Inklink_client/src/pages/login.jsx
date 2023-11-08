import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

const Login_Page = ({ login, setLogin, setName, setUserId }) => {
  let navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      let res = await axios.post("http://127.0.0.1:8000/users/login", {
        userName: userName,
        password: password
      });

      message.success("Login successfully!");

      if (res.status === 200) {
        navigate.push("/");
        setLogin(true);
        setName(userName);
        setUserId(res.data);
      }

      return;
    } catch (error) {
      console.log(error);

      if (userName === "" || password === "") {
        message.error("Username or password cannot be empty!");
      } else {
        message.error("Your username or password is wrong!");
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
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
              className="wide-form-button"
              onClick={() => handleLogin()}
            >
              Login
            </Button>
            <div className="signup-text">
                Don't have an Account? <Link to="/signUp">Sign Up</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login_Page;
