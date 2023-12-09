import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import { callApi } from '../utils/axios_client';
import { Link } from 'react-router-dom';
const Home = () => {
  const [sellPosts, setSellPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);
  useEffect(() => {
    // 获取卖书贴文
    const fetchSellPosts = async () => {
      try {
        const requests = [];
        for (let i = 1550; i >= 1400; i--) {
          try {
            const response = await callApi(`http://localhost:8000/requests/sell/${i}`, 'get');
            const data = response.data;
            if (data.status === 'Remained') {
              requests.push(data);
            }
          } catch (error) {
            // 如果是 404 错误，说明请求不存在，可以忽略
            if (error.response?.status === 404) {
              console.error(`Failed to fetch sell post with request_id ${i}:`, error);
            }
          }
        }

        // 过滤掉不存在的请求
        const validRequests = requests.filter((request) => request !== null);

        setSellPosts(validRequests.slice(0, 50));
      } catch (error) {
        console.error('Failed to fetch sell posts:', error);
      }
    };

    // 获取交换文贴文
    const fetchExchangePosts = async () => {
      try {
        const requests = [];
        for (let i = 1; i <= 100; i++) {
          try {
            const response = await callApi(`http://localhost:8000/requests/exchange/${i}`, 'get');
            const data = response.data;

            // 只保留 status 为 Remained 的贴文
            if (data.status === 'Remained') {
              requests.push(data);
            }
          } catch (error) {
            // 如果是 404 错误，说明请求不存在，可以忽略
            if (error.response?.status !== 404) {
              console.error(`Failed to fetch exchange post with request_id ${i}:`, error);
            }
          }
        }

        // 过滤掉不存在的请求
        const validRequests = requests.filter((request) => request !== null);

        setExchangePosts(validRequests.slice(0, 50));
      } catch (error) {
        console.error('Failed to fetch exchange posts:', error);
      }
    };

    fetchSellPosts();
    fetchExchangePosts();
  }, []);
  
  const renderDetailLink = (record, type) => (
    <Link to={`/${type}/${record.request_id}`}>
      <Button className='bg-blue-500' type="primary">Detail</Button>
    </Link>
  );
  const renderDetail = (record, type) => (
    <Link to={`/${type}/${record.request_id}`}>
      <Button className='bg-blue-500' type="primary">
        Detail
      </Button>
    </Link>
  );
  const sellColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'ISBN List',
      dataIndex: 'isbn_list',
      key: 'isbn_list',
      render: (isbnList) => isbnList.join(', '), // 将数组转换为逗号分隔的字符串
    },
    {
      title: 'Quantity',
      dataIndex: 'no_of_copies_list',
      key: 'no_of_copies_list',
      render: (text, record) => renderDetailLink(record, 'sell'),
    },
  ];

  const exchangeColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'ISBN List',
      dataIndex: 'isbn_list',
      key: 'isbn_list',
      render: (isbnList) => isbnList.join(', '), // 将数组转换为逗号分隔的字符串
    },
    {
      title: 'Description',
      dataIndex: 'wishlist_description',
      key: 'wishlist_description',
    },
    {
      title: 'Quantity',
      dataIndex: 'no_of_copies_list',
      key: 'no_of_copies_list',
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'exchange'),
    },
  ];

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">賣書文</h2>
        <Table dataSource={sellPosts} columns={sellColumns} rowKey="request_id" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">交換文</h2>
        <Table dataSource={exchangePosts} columns={exchangeColumns} rowKey="request_id" />
      </div>
    </div>
  );
};

export default Home;
