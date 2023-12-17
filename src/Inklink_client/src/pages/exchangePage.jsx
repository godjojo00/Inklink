import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { callApi } from '../utils/axios_client';
import { Table, Form, Input, Button, Modal, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useUser } from '../Usercontext';

const ExchangePage = () => {
    const [exchangePost, setExchangePost] = useState(null);
    const [responses, setResponses] = useState([]);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [form] = Form.useForm();
    const { requestId } = useParams();
    const { user } = useUser();
    const [responderInfo, setResponderInfo] = useState(null); // New state for responder's info
    const [responderInfoModalVisible, setResponderInfoModalVisible] = useState(false); // State to control the visibility of the responder info modal

    useEffect(() => {
        const fetchExchangePost = async () => {
            try {
                const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}`, 'get');
                const exchangeData = response.data;

                const bookDetailsPromises = exchangeData.isbn_list.map(async (isbn) => {
                    try {
                        const bookDetailsResponse = await callApi(`http://localhost:8000/books/book?isbn=${isbn}`, 'get');
                        return bookDetailsResponse.data;
                    } catch (error) {
                        return { isbn, title: 'N/A', authors: 'N/A', edition: 'N/A' };
                    }
                });

                const bookDetailsList = await Promise.all(bookDetailsPromises);
                const transformedBookDetails = transformBookDetails(bookDetailsList, exchangeData.no_of_copies_list, exchangeData.book_condition_list);
                setExchangePost({ ...exchangeData, bookDetailsList: transformedBookDetails });
            } catch (error) {
                console.error(`Failed to fetch exchange post with request_id ${requestId}:`, error);
            }
        };

        fetchExchangePost();
    }, [requestId]);

    const fetchResponses = async () => {
        try {
            const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}/responses`, 'get');
            if (response.data && response.data.response_list) {
                // setExchangePost(response.data);

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

    useEffect(() => {
        fetchResponses();
    }, [exchangePost])

    const fetchResponderInfo = async (responderId) => {
        try {
            const responderInfoResponse = await callApi(`http://localhost:8000/users/${responderId}`, 'get');
            setResponderInfo(responderInfoResponse.data);
        } catch (error) {
            console.error(`Failed to fetch responder details for responder ID ${responderId}:`, error);
        }
    };

    const handleConfirmExchange = async (responseId) => {
        try {
            const response = await callApi(`http://localhost:8000/requests/confirm-exchange/${parseInt(requestId, 10)}?response_id=${responseId}&user_id=${user.userId}`, 'patch');

            message.success('Exchange confirmed successfully!');
            // 可以根據需要更新頁面狀態或執行其他操作
            await fetchResponderInfo(response.data.responder_id);
            setResponderInfoModalVisible(true);
            setExchangePost({ ...exchangePost, status: 'Accepted' });
        } catch (error) {
            console.error('Failed to confirm exchange:', error);
            message.error('Failed to confirm exchange. ' + error.detail);
        }
    };

    const exchangePostColumns = [
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
          },
          {
            title: 'Book Title',
            dataIndex: 'title',
            key: 'title',
          },
          {
            title: 'Author',
            dataIndex: 'authors',
            key: 'authors',
          },
          {
            title: 'Edition',
            dataIndex: 'edition',
            key: 'edition',
          },
          {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
          },
          {
            title: 'Book Condition',
            dataIndex: 'bookCondition',
            key: 'bookCondition',
          },
    ];

    const getAvailableResponseColumns = (user, exchangePost, handleConfirmExchange) => {
        let columns = [
            {
                title: 'Responder',
                dataIndex: 'username',
                key: 'username',
            },
            {
                title: 'ISBN List',
                dataIndex: 'isbn_list',
                key: 'isbn_list',
                render: (isbnList) => (isbnList ? isbnList.join(', ') : ''),
            },
            {
                title: 'Quantity List',
                dataIndex: 'no_of_copies_list',
                key: 'no_of_copies_list',
                render: (noOfCopiesList) => (noOfCopiesList ? noOfCopiesList.join(', ') : ''),
            },
            {
                title: 'Book Condition List',
                dataIndex: 'book_condition_list',
                key: 'book_condition_list',
                render: (bookConditionList) => (bookConditionList ? bookConditionList.join(', ') : ''),
            },
        ];
    
        if (user && exchangePost && exchangePost.status === 'Remained' && user.userId === exchangePost.poster_id) {
            columns.push({
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
            });
        }
    
        return columns;
    };

    const onFinish = async (values) => {
        try {
          const response = await callApi('http://localhost:8000/responses/', 'post', {
            request_id: parseInt(requestId, 10),
            responder_id: user.userId,
            isbn_list: values.books.map(book => book.isbn),
            no_of_copies_list: values.books.map(book => parseInt(book.quantity, 10)),
            book_condition_list: values.books.map(book => book.condition),
          });
          
          message.success('Response added successfully!');
          await fetchResponses();
          form.resetFields();
        } catch (error) {
            console.error('Failed to add response:', error);
            message.error('Failed to add response: ' + error.detail);
        }
    };

    const handleDeleteExchangeRequest = async () => {
        Modal.confirm({
            title: 'Are you sure you want to delete this request?',
            content: 'This action cannot be undone.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'No, cancel',
            onOk: async () => {
                try {
                    const response = await callApi(`http://localhost:8000/requests/delete-exchange/${requestId}?user_id=${user.userId}`, 'patch');
                    if (response.status === 204) {
                        message.success('Exchange request deleted successfully!');
                        setExchangePost({ ...exchangePost, status: 'Deleted' });
                    }
                } catch (error) {
                    console.error('Failed to delete exchange request:', error);
                    message.error('Failed to delete the request. ' + error.detail);
                }
            },
        });
    };

    const transformBookDetails = (bookDetailsList, noOfCopiesList, bookConditionList) => {
        return bookDetailsList.map((book, index) => ({
          key: book.isbn,
          title: book.title || 'N/A',
          authors: book.author_list ? book.author_list.join(', ') : 'N/A',
          edition: book.edition_name || 'N/A',
          isbn: book.isbn,
          quantity: noOfCopiesList[index],
          bookCondition: bookConditionList[index], 
        }));
    };

    const closeResponderInfoModal = () => {
        setResponderInfoModalVisible(false);
    };

    const hasUserAlreadyResponded = () => {
        return responses.some(response => response.username === user.username);
    };

    return (
        <div className="container mx-auto mt-8">
            {exchangePost && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Exchange Request Details</h2>
                    <p><strong>Request ID:</strong> {exchangePost?.request_id}</p>
                    <p><strong>Posted By:</strong> {exchangePost?.seller_name}</p>
                    <p><strong>Wishlist Description:</strong> {exchangePost.wishlist_description}</p>
                    <p><strong>Status:</strong> {exchangePost?.status}</p>
                    <Table dataSource={exchangePost.bookDetailsList} columns={exchangePostColumns} rowKey="isbn" />
                </div>
            )}

            {responses.length > 0 && exchangePost &&
                (exchangePost.status === 'Remained' || exchangePost.status === 'Accepted') && (
                <div>
                    {exchangePost.status === 'Remained' ? 
                        <h2 className="text-2xl font-bold mb-4">Available Responses</h2> :
                        <h2 className="text-2xl font-bold mb-4">Accepted Response</h2>
                    }
                    <Table
                        key={responses.length}
                        dataSource={responses.filter((response) => response.status === (exchangePost.status === 'Remained' ? 'Available' : 'Accepted'))}
                        columns={getAvailableResponseColumns(user, exchangePost, handleConfirmExchange)}
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
                    <p>Book Condition List: {selectedResponse.book_condition_list.join(', ')}</p>
                    {/* Display more details if needed */}
                </div>
            )}

            {exchangePost && user && user.role === "user"
                && exchangePost.status === "Remained" && exchangePost.poster_id !== user.userId 
                && !hasUserAlreadyResponded() && (
            <Form form={form} onFinish={onFinish} className="mt-4">
                <Form.List
                    name="books"
                    initialValue={[{}]} // Initialize with one empty book entry
                    >
                    {(fields, { add, remove }) => (
                        <>
                        {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                            <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                            <Form.Item
                                {...restField}
                                name={[name, 'isbn']}
                                fieldKey={[fieldKey, 'isbn']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter the ISBN!',
                                    },
                                    {
                                        pattern: /^(?:\d{10}|\d{13})$/,
                                        message: 'ISBN must be a string with 10 or 13 characters!',
                                    },
                                ]}
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                <Input placeholder="ISBN" />
                            </Form.Item>
                            <Form.Item
                                {...restField}
                                name={[name, 'quantity']}
                                fieldKey={[fieldKey, 'quantity']}
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
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                <Input placeholder="Quantity" type="number" />
                            </Form.Item>
                            <Form.Item
                                {...restField}
                                name={[name, 'condition']}
                                fieldKey={[fieldKey, 'condition']}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter the condition!',
                                    },
                                ]}
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                <Input placeholder="Condition" />
                            </Form.Item>
                            {index > 0 && (
                                <MinusCircleOutlined onClick={() => remove(name)} />
                            )}
                            </div>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add Book to Response
                            </Button>
                        </Form.Item>
                        </>
                    )}
                    </Form.List>

                <Form.Item>
                <Button className='bg-blue-500 hover:bg-blue-700 text-white' type="primary" htmlType="submit">
                    Submit Response
                </Button>
                </Form.Item>
            </Form>
            )}

            {user && exchangePost && user.userId === exchangePost.poster_id && exchangePost.status === 'Remained' && (
                <Button 
                    className='bg-red-500 text-white' 
                    type="danger" 
                    onClick={handleDeleteExchangeRequest}
                >
                    Delete Request
                </Button>
            )}

            <Modal
                title="Responder Information"
                visible={responderInfoModalVisible}
                onCancel={closeResponderInfoModal}
                footer={[
                    <Button key="back" onClick={closeResponderInfoModal}>
                        Close
                    </Button>,
                ]}
            >
                <p>Responder Username: {responderInfo?.username}</p>
                <p>Responder Email: {responderInfo?.email}</p>
                <p>Responder Phone: {responderInfo?.phone_number}</p>
            </Modal>
        </div>
    );
};

export default ExchangePage;
