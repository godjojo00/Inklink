import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, List, message } from 'antd';
import { callApi } from '../utils/axios_client';
import { useParams } from 'react-router-dom';

const ExchangePage = () => {
  const [exchangePost, setExchangePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const { request_id } = useParams(); // 使用 useParams 获取 request_id

  useEffect(() => {
    console.log('request_id:', request_id);
    const fetchExchangePost = async () => {
      try {
        const response = await callApi(`http://localhost:8000/requests/exchange/${request_id}`, 'get');
        setExchangePost(response.data);
      } catch (error) {
        console.error(`Failed to fetch exchange post with request_id ${request_id}:`, error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await callApi(`http://localhost:8000/requests/exchange/${request_id}/responses`, 'get');
        setComments(response.data);
      } catch (error) {
        console.error(`Failed to fetch comments for exchange post with request_id ${request_id}:`, error);
      }
    };

    fetchExchangePost();
    fetchComments();
  }, [request_id]);

  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Number of Copies',
      dataIndex: 'no_of_copies',
      key: 'no_of_copies',
    },
  ];

  const onFinish = async () => {
    try {
      await callApi('http://localhost:8000/requests/exchange', 'post', {
        request_id,
        content: commentText,
      });

      // 刷新留言列表
      const response = await callApi(`http://localhost:8000/requests/exchange/${request_id}/responses`, 'get');
      setComments(response.data);

      // 清空输入框
      setCommentText('');

      message.success('Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Failed to add comment. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
 {exchangePost && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Exchange Post Details</h2>
                    <Table dataSource={exchangePost.isbn_list.map((isbn, index) => ({ isbn, no_of_copies: exchangePost.no_of_copies_list[index] }))} columns={columns} rowKey="isbn" />

                    <div className="mt-4">
                        <p>Wishlist Description: {exchangePost.wishlist_description}</p>
                        <p>Posting Time: {exchangePost.posting_time}</p>
                        <p>Poster ID: {exchangePost.poster_id}</p>
                        <p>Status: {exchangePost.status}</p>
                    </div>
                </div>
            )}

            {exchangePost && exchangePost.status !== 'Deleted' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Comments</h2>
                    <List
                        dataSource={comments}
                        renderItem={(comment) => (
                            <List.Item>
                                <p>{comment.content}</p>
                            </List.Item>
                        )}
                    />

                    <Form onFinish={onFinish} className="mt-4">
                        <Form.Item name="commentText">
                            <Input.TextArea
                                name="commentText"  // 添加这行，与 Form.Item 的 name 对应
                                rows={4}
                                placeholder="Leave a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button className='bg-blue-600' type="primary" htmlType="submit">
                                Add Comment
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
    </div>
  );
};

export default ExchangePage;
