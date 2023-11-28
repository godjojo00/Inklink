import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Table } from 'antd';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
import { callApi } from '../utils/axios_client';
import { useUser } from '../Usercontext';
import { useNavigate } from 'react-router-dom';

const Owns = ({ token }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  console.log(user.userId)
  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ];

  // 修改函数名为 getBooks
  const getBooks = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      // 使用 callApi 函数发起 GET 请求
      const response = await callApi(
        `http://localhost:8000/users/own/${user.user_id}`,
        'get',
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.status === 200) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getBooks();
  }, [user, token]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // 在添加书籍前先获取用户ID
      await getBooks();

      // 使用 callApi 函数发起 POST 请求
      const response = await callApi(
        'http://localhost:8000/users/own',
        'post',
        {
          user_id: user.user_id,
          isbn: values.isbn,
          quantity: values.quantity,
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.status === 201) {
        message.success('Book added successfully!');
        form.resetFields();
        getBooks();
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Add Books</h1>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          name="isbn"
          label="ISBN"
          rules={[
            {
              required: true,
              message: 'Please enter the book ISBN!',
            },
          ]}
        >
          <Input
            prefix={<BookOutlined className="site-form-item-icon" />}
            placeholder="ISBN"
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            {
              required: true,
              message: 'Please enter the quantity!',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            type="number"
            placeholder="Quantity"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: '100%' }}
            className='bg-blue-500'
          >
            Add Book
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginTop: '20px' }}>
        <h2>My Books</h2>
        <Table dataSource={books} columns={columns} />
      </div>
    </div>
  );
};

export default Owns;
