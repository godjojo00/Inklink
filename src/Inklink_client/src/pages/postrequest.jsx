import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Radio } from 'antd';
import { callApi } from '../utils/axios_client';
import { useUser } from '../Usercontext';
import { useNavigate } from 'react-router-dom';

const PostRequest = ({ username, token, fetchRequests }) => {
    const [form] = Form.useForm();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [showPrice, setShowPrice] = useState(false);
    const [showWishList, setShowWishList] = useState(false);
    const navigate = useNavigate();

    const getUserId = async () => {
        try {
            if (!user) {
                navigate("/login");
                return;
            }
            const response = await callApi(
                `http://localhost:8000/users/own/${user.userId}`,
                'get',
                null,
                {
                    Authorization: `Bearer ${token}`,
                }
            );
            if (response.status === 200) {
                // Update logic as needed
            }
        } catch (error) {
            console.log(error);
        }
    };

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

            // Create the request payload based on the new backend structure
            const requestData = {
                request_info: {
                    poster_id: user.userId,
                    isbn_list: [values.isbn],
                    no_of_copies_list: [values.quantity],
                    book_condition_list: [values.condition],
                },
                price: requestType === 'sell' ? values.price : undefined,
                wishlist_description: requestType === 'exchange' ? values.wishList : undefined,
            };

            // Use callApi function instead of axios.post
            const response = await callApi(`http://localhost:8000/requests/${requestType}`, 
            'post', 
            null, 
            {
                Authorization: `Bearer ${token}`,
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
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">Post your Request!</h1>
                <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 400 }}>
                    <Form.Item name="requestType" label="Request Type">
                        <Radio.Group onChange={handleRadioChange}>
                            <Radio value="sell">Sell</Radio>
                            <Radio value="exchange">Exchange</Radio>
                        </Radio.Group>
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
                                // ... Other validation rules ...
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Enter your wish list (books you are looking for)"
                                autoSize={{ minRows: 3, maxRows: 5 }}
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button className='bg-blue-500 hover:bg-blue-700 text-white' type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                            Publish Request
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default PostRequest;
