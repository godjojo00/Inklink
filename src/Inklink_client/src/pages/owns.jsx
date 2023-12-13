import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Table } from 'antd';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
import { callApi } from '../utils/axios_client';
import { useUser } from '../Usercontext';
import { useNavigate } from 'react-router-dom';
const Owns = ({ username, token }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [user.user_id, token]);

  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Quantity',
      dataIndex: 'no_of_copies',
      key: 'no_of_copies',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => showEditModal(record)}>Edit</Button>
      ),
    },
  ];
  useEffect(() => {
    fetchBooks();
  }, [user.user_id, token]);

  const getUserId = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }
      const response = await callApi(
        `http://localhost:8000/users/own/${user.userId}`,
        'get',
        user.userId,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      if (response.status === 200) {
        setBooks(response.data.map(book => ({ ...book, key: book.isbn })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBooks = async () => {
    try {
      await getUserId();
      if (!user) {
        navigate("/login");
        return;
      }
      const response = await callApi(
        `http://localhost:8000/users/own/${user.userId}`,
        'get',
        user.userId,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.status === 200) {
        setBooks(response.data.map(book => ({ ...book, key: book.isbn })));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // 在添加书籍前先获取用户ID
      await getUserId();

      // 使用 callApi 函数发起 POST 请求
      const response = await callApi(
        'http://localhost:8000/users/own',
        'post',
        {
          user_id: user.userId,
          isbn_list: [values.isbn],
          no_of_copies_list: [parseInt(values.no_of_copies)],
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      if (response.status === 201) {
        message.success('Book added successfully!');
        form.resetFields();
        fetchBooks();
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (book) => {
    setSelectedBook(book);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const updateButtonStyle = {
    backgroundColor: '#1890ff', // Ant Design blue color
    color: 'white',
    borderColor: '#1890ff'
  };

  const handleUpdate = async (values) => {
    try {
      const response = await callApi(
        'http://localhost:8000/users/own',
        'patch',
        {
          user_id: user.userId,
          isbn_list: [selectedBook.isbn],
          no_of_copies_list: [parseInt(values.quantity)],
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      if (response.status === 200) {
        message.success('Book quantity updated successfully!');
        fetchBooks(); // Refresh the book list
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to update book quantity. Please try again.');
    }
    setIsModalVisible(false);
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
          name="no_of_copies"
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

      <Modal
        title="Edit Book Quantity"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleUpdate}>
          <Form.Item
            name="quantity"
            label="Quantity"
            initialValue={selectedBook?.no_of_copies}
            rules={[{ required: true, message: 'Please enter the new quantity!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={updateButtonStyle}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Owns;
