import React, { useState, useEffect } from 'react';
import { Form, Input, Rate, Button, message } from 'antd';
import { callApi } from '../utils/axios_client';
import { useUser } from '../Usercontext';

const RatingPage = () => {
  const { user } = useUser();
  const [averageRating, setAverageRating] = useState(null);
  const [myUsername, setMyUsername] = useState(null);
  const [otherUsername, setOtherUsername] = useState('');
  const [otherUserRating, setOtherUserRating] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 取得用戶資料
        const userResponse = await callApi(`http://localhost:8000/users/${user.userId}`);
        if (userResponse.status === 200) {
          const { username, agg_rating } = userResponse.data;
          setMyUsername(username);
          setAverageRating(agg_rating);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    if (user.role === "user") {
      fetchUserData();
    }
  }, [user.userId, user.role]);

  const onFinish = async (values) => {
    try {
      const response = await callApi(`http://localhost:8000/ratings/${parseInt(values.request_id, 10)}?rating_user_id=${user.userId}&score=${parseInt(values.rating, 10)}`, 'post');

      if (response.status === 201) {
        message.success('Rating submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      message.error(error.detail.toString());
    }
  };

  const handleSearchRating = async () => {
    setSearchPerformed(true);
    try {
      const response = await callApi(`http://localhost:8000/ratings/user?username=${otherUsername}`, 'get');
      if (response.status === 200) {
        setOtherUserRating(response.data);
      } else {
        setOtherUserRating(null);
      }
    } catch (error) {
      console.error('Failed to search rating:', error);
      message.error('Failed to find user rating');
      setOtherUserRating(null);
    }
  };

  const onUsernameChange = (e) => {
    setOtherUsername(e.target.value);
    if (searchPerformed) {
      setOtherUserRating(null);
      setSearchPerformed(false);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      {user.role === "user" && (
        <>
          <div className="text-2xl font-bold mb-4">
            Hi, {myUsername ? `${myUsername}!` : 'Loading...'}
          </div>

          {averageRating != null ? (
            <div className="mb-4">
              <p>This is your average rating score: {averageRating}</p>
              <Rate disabled allowHalf defaultValue={averageRating} />
            </div>
          ) : (
            <div className="mb-4">
              <p>Your average rating is not available.</p>
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-4">You can rate your deal here!</h2>
          <Form
            name="rating_form"
            onFinish={onFinish}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 12 }}
          >
            <Form.Item
              label="Request ID"
              name="request_id"
              rules={[{ required: true, message: 'Please enter Request ID!' }]}
            >
              <Input placeholder="Enter the Request ID you want to rate" />
            </Form.Item>

            <Form.Item
              label="Rating"
              name="rating"
              rules={[{ required: true, message: 'Please enter Rating!' }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
              <Button className="bg-blue-500" type="primary" htmlType="submit">
                Submit Rating
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <h2 className="text-2xl font-bold mb-4">Search User Rating</h2>
        <Input
          placeholder="Enter another user's username"
          value={otherUsername}
          onChange={onUsernameChange}
          style={{ width: 300, marginRight: 10 }}
        />
        <Button onClick={handleSearchRating}>Search</Button>
        {searchPerformed && otherUserRating != null ? (
          <div className="mb-4">
            <p>{otherUsername}'s average rating score: {otherUserRating}</p>
            <Rate disabled allowHalf value={otherUserRating} />
          </div>
        ) : searchPerformed && (
          <div className="mb-4">
            {otherUsername && (
              <p>{otherUsername}'s average rating score is not available.</p>
            )}
          </div>
        )}
    </div>
  );
};

export default RatingPage;
