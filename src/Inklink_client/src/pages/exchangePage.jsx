import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { callApi } from '../utils/axios_client';
import { Button, Spin, Table, Modal, Form, Input, List, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const ExchangePage = () => {
  const { requestId } = useParams();
  const [exchangePost, setExchangePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchangePost = async () => {
      try {
        const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}`, 'get');
        setExchangePost(response.data);
      } catch (error) {
        console.error(`Failed to fetch exchange post with request_id ${requestId}:`, error);
      }
    };

    const fetchComments = async () => {
      try {
        // const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}/responses`, 'get');
        // setComments(response.data);
      } catch (error) {
        console.error(`Failed to fetch comments for exchange post with request_id ${requestId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangePost();
    fetchComments();
  }, [requestId]);

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
      // Call API to add comment
      await callApi(`http://localhost:8000/responses`, 'post', {
        content: commentText,
      });

      // Refresh comments
      const response = await callApi(`http://localhost:8000/requests/exchange/${requestId}/responses`, 'get');
      setComments(response.data);

      // Clear input
      setCommentText('');

      message.success('Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Failed to add comment. Please try again.');
    }
  };

  if (loading) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
  }

  return (
    <div>
      {exchangePost && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Exchange Post Details</h2>
          <Table
            dataSource={exchangePost.isbn_list.map((isbn, index) => ({ isbn, no_of_copies: exchangePost.no_of_copies_list[index] }))}
            columns={columns}
            rowKey="isbn"
          />

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
                name="commentText"
                rows={4}
                placeholder="Leave a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button className="bg-blue-600" type="primary" htmlType="submit">
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
