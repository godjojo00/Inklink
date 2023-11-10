import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Table } from 'antd';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';

const Owns = ({ userId, token }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);

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

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/users/${userId}/owns`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    fetchBooks();
  }, []); // 在组件挂载时获取用户已有书籍

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // 发送 POST 请求到后端
      const response = await axios.post(
        `http://127.0.0.1:8000/users/${userId}/owns`,
        {
          isbn: values.isbn,
          quantity: values.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        message.success('Book added successfully!');
        form.resetFields();
        fetchBooks(); // 在添加书籍后刷新书籍列表
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
