import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { callApi } from '../utils/axios_client';
import { Table, Form, Input, Button, message } from 'antd';
import { useUser } from '../Usercontext';

const ExchangePage = () => {
    const [exchangePost, setExchangePost] = useState(null);
    const [responses, setResponses] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [form] = Form.useForm();
    const { requestId } = useParams();
    const { user } = useUser();

    useEffect(() => {
        const fetchExchangePost = async () => {
            try {
                const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}`, 'get');
                setExchangePost(response.data);
            } catch (error) {
                console.error(`Failed to fetch exchange post with request_id ${requestId}:`, error);
            }
        };

        const fetchResponses = async () => {
            try {
                const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}/responses`, 'get');
                if (response.data && response.data.response_list) {
                    setExchangePost(response.data);

                    // Assuming there is a responses endpoint for Exchange posts
                    const detailedResponses = await Promise.all(response.data.response_list.map(async (item) => {
                        const detailedResponse = await callApi(`http://localhost:8000/responses/${item.response_id}`, 'get');
                        return detailedResponse.data;
                    }));

                    setResponses(detailedResponses);
                } else {
                    console.error('Invalid data structure:', response.data);
                }
                // setResponses(detailedResponses);
            } catch (error) {
                console.error(`Failed to fetch responses for exchange post with request_id ${requestId}:`, error);
            }
        };

        fetchExchangePost();
        fetchResponses();
    }, [requestId]);

    const handleConfirmExchange = async (responseId) => {
        try {
            const response = await callApi(`http://localhost:8000/requests/confirm-exchange/${requestId}`, 'patch', {
                response_id: responseId,
                user_id: user.userId,
            });

            message.success('Exchange confirmed successfully!');
            // 可以根據需要更新頁面狀態或執行其他操作
        } catch (error) {
            console.error('Failed to confirm exchange:', error);
            message.error('Failed to confirm exchange. Please try again.');
        }
    };

    const columns = [
        {
            title: 'ISBN',
            dataIndex: 'isbn_list',
            key: 'isbn_list',
            render: (isbnList) => (isbnList ? isbnList.join(', ') : ''),
        },
        {
            title: 'Number of Copies',
            dataIndex: 'no_of_copies_list',
            key: 'no_of_copies_list',
            render: (noOfCopiesList) => (noOfCopiesList ? noOfCopiesList.join(', ') : ''),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button
                    className='bg-blue-500'
                    type="primary"
                    onClick={() => handleConfirmExchange(record.response_id)}
                >
                    Confirm Exchange
                </Button>
            ),
        },
    ];

    const fetchResponseDetails = async (responseId) => {
        try {
            const response = await callApi(`http://localhost:8000/responses/${responseId}`, 'get');
            setSelectedResponse(response.data);
        } catch (error) {
            console.error(`Failed to fetch response details for response_id ${responseId}:`, error);
        }
    };

    const onFinish = async (values) => {
        try {
            const response = await callApi('http://localhost:8000/responses/', 'post', {
                request_id: requestId,
                responder_id: user.userId,
                isbn_list: [values.isbn_list],
                no_of_copies_list: [values.no_of_copies_list],
                book_condition_list: [values.book_condition_list],
            });

            message.success('Response added successfully!');
            form.resetFields();
            setResponses((prevResponses) => [prevResponses, response.data]);
        } catch (error) {
            console.error('Failed to add response:', error);
            message.error('Failed to add response. Please try again.');
        }
    };

    return (
        <div className="container mx-auto mt-8">
            {exchangePost && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Exchange Post Details</h2>
                    <p>Wishlist Description: {exchangePost.wishlist_description}</p>
                    <Table dataSource={[exchangePost]} columns={columns} rowKey="request_id" />
                </div>
            )}

            {responses.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Available Responses</h2>
                    <Table
                        dataSource={responses.filter((response) => response.status === 'Available')}
                        columns={columns}
                        rowKey="response_id" // 指定一个唯一的字段作为 key
                    />
                </div>
            )}

            {selectedResponse && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Selected Response Details</h2>
                    <p>Response ID: {selectedResponse.response_id}</p>
                    <p>ISBN List: {selectedResponse.isbn_list.join(', ')}</p>
                    <p>Number of Copies List: {selectedResponse.no_of_copies_list.join(', ')}</p>
                    {/* Display more details if needed */}
                </div>
            )}

            <Form form={form} onFinish={onFinish} className="mt-4">
                <Form.Item name="isbn_list" label="ISBN List">
                    <Input placeholder="Enter ISBNs separated by commas" />
                </Form.Item>
                <Form.Item name="no_of_copies_list" label="Number of Copies List">
                    <Input placeholder="Enter number of copies separated by commas" />
                </Form.Item>
                <Form.Item name="book_condition_list" label="Book Condition List">
                    <Input placeholder="Enter book conditions separated by commas" />
                </Form.Item>
                <Form.Item>
                    <Button className="bg-blue-600" type="primary" htmlType="submit">
                        Submit Response
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ExchangePage;
