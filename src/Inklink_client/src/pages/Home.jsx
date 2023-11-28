import React, { useState, useEffect } from 'react';
import { callApi } from '../utils/axios_client';

const Home = () => {
  const [sellPosts, setSellPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);

  useEffect(() => {
    // 获取卖书贴文
    const fetchSellPosts = async () => {
      try {
        const sellResponse = await callApi('http://localhost:8000/requests/sell', 'post');
        setSellPosts(sellResponse.data);
      } catch (error) {
        console.error('Failed to fetch sell posts:', error);
      }
    };

    // 获取交换文贴文
    const fetchExchangePosts = async () => {
      try {
        const exchangeResponse = await callApi('http://localhost:8000/requests/exchange');
        setExchangePosts(exchangeResponse.data);
      } catch (error) {
        console.error('Failed to fetch exchange posts:', error);
      }
    };

    fetchSellPosts();
    fetchExchangePosts();
  }, []);

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">賣書文</h2>
        <div className="grid grid-cols-3 gap-4">
          {sellPosts.map((post) => (
            <div key={post.request_id} className="bg-gray-100 p-4 rounded">
              {/* 显示卖书贴文的内容 */}
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">交換文</h2>
        <div className="grid grid-cols-3 gap-4">
          {exchangePosts.map((post) => (
            <div key={post.request_id} className="bg-gray-100 p-4 rounded">
              {/* 显示交换文的内容 */}
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
