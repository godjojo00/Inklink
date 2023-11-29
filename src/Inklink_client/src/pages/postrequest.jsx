import React, { useState } from 'react';
import { Form, Input, Button, message, Radio } from 'antd';
import axios from 'axios';
import './PostRequest.css';

const PostRequest = ({ userId, token, fetchRequests }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showWishList, setShowWishList] = useState(false);

  const handleRadioChange = (e) => {
    const value = e.target.value;
    form.setFieldsValue({
      requestType: value,
      price: value === 'sell' ? form.getFieldValue('price') : undefined,
      wishList: value === 'exchange' ? form.getFieldValue('wishList') : undefined,
    });

    setShowPrice(value === 'sell');
    setShowWishList(value === 'exchange');
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Determine request type
      const requestType = values.requestType;

      // Prepare data based on request type
      const requestData = {
        userId,
        type: requestType,
        books: {
          title: values.title,
          isbn: values.isbn,
          quantity: values.quantity,
          condition: values.condition,
        },
      };

      // Add additional fields based on request type
      if (requestType === 'sell') {
        requestData.books.price = values.price;
      } else if (requestType === 'exchange') {
        requestData.wishList = values.wishList;
      }

      // Send POST request to create a new request
      const response = await axios.post(
        `http://127.0.0.1:8000/requests`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        message.success('Request published successfully!');
        form.resetFields();
        fetchRequests(); // Refresh the requests list
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to publish request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postrequest-container">
      <div className="postrequest-box">
        <h1 className="text-2xl font-bold mb-6">Post your Request!</h1>
        <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item name="requestType" label="Request Type">
            <Radio.Group onChange={handleRadioChange}>
              <Radio value="sell">Sell</Radio>
              <Radio value="exchange">Exchange</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item 
            name="title"
            label="Book Title"
            rules={[
              {
                required: true,
                message: 'Please enter the book title!',
              },
            ]}
          >
            <Input placeholder="Book Title" />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN"
            rules={[
              {
                required: true,
                message: 'Please enter the ISBN!',
              },
              {
                len: 13,
                type: 'string',
                message: 'ISBN must be a string with 13 characters!',
              },
            ]}
          >
            <Input placeholder="ISBN" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              {
                required: true,
                message: 'Please enter the quantity!',
              },
              {
                validator(_, value) {
                  const intValue = parseInt(value, 10);
                  if (!isNaN(intValue) && intValue > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Quantity must be a positive integer!'));
                },
              },
            ]}
          >
            <Input placeholder="Quantity" type="number" step={1} />
          </Form.Item>

          <Form.Item
            name="condition"
            label="Condition"
            rules={[
              {
                required: true,
                message: 'Please enter the condition!',
              },
            ]}
          >
            <Input placeholder="Condition" />
          </Form.Item>

          {showPrice && (
            <Form.Item
              name="price"
              label="Price"
              rules={[
                {
                  required: true,
                  message: 'Please enter the price!',
                },
                {
                  validator(_, value) {
                    const intValue = parseInt(value, 10);
                    if (!isNaN(intValue) && intValue > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Price must be a positive integer!'));
                  },
                },
              ]}
            >
              <Input placeholder="Price" type="number" step={100} />
            </Form.Item>
          )}

          {showWishList && (
            <Form.Item
              name="wishList"
              label="Wish List"
              rules={[
                {
                  required: true,
                  message: 'Please enter your wish list!',
                },
              ]}
            >
              <Input.TextArea
                placeholder="Enter your wish list (books you are looking for)"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Publish Request
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default PostRequest;
