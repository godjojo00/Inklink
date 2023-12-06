import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { callApi } from '../utils/axios_client';

const Home = () => {
  const [sellPosts, setSellPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);

  useEffect(() => {
    const fetchData = async (url, setState) => {
      try {
        const requests = [];
        for (let i = 1; i <= 1600; i++) {
          try {
            const response = await callApi(`${url}/${i}`, 'get');
            requests.push(response.data);
          } catch (error) {
            if (error.response?.status !== 404) {
              console.error(`Failed to fetch post with request_id ${i}:`, error);
            }
          }
        }

        const validRequests = requests.filter((request) => request !== null);
        setState(validRequests.slice(0, 50));
      } catch (error) {
        console.error(`Failed to fetch posts: ${url}`, error);
      }
    };

    fetchData('http://localhost:8000/requests/sell', setSellPosts);
    fetchData('http://localhost:8000/requests/exchange', setExchangePosts);
  }, []);

  const renderDetailLink = (record, type) => (
    <Link to={`/${type}requestdetail/${record.request_id}`}>
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
      render: (text, record) => <Link to={`/sellrequestdetail/${record.request_id}`}>{text}</Link>,
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
      render: (isbnList) => isbnList.join(', '),
    },
    {
      title: 'Quantity',
      dataIndex: 'no_of_copies_list',
      key: 'no_of_copies_list',
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetailLink(record, 'sell'),
    },
  ];

  const exchangeColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
      render: (text, record) => <Link to={`/exchangerequestdetail/${record.request_id}`}>{text}</Link>,
    },
    {
      title: 'ISBN List',
      dataIndex: 'isbn_list',
      key: 'isbn_list',
      render: (isbnList) => isbnList.join(', '),
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
      render: (text, record) => renderDetailLink(record, 'exchange'),
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
