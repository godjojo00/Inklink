import React, { useState, useEffect } from 'react';
import { Table, Button, Pagination, Tabs } from 'antd';
import { callApi } from '../utils/axios_client';
import { Link } from 'react-router-dom';

const { TabPane } = Tabs;

const Home = () => {
  const [sellPosts, setSellPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);
  const [currentSellPage, setCurrentSellPage] = useState(1);
  const [currentExchangePage, setCurrentExchangePage] = useState(1);
  const [totalSellPosts, setTotalSellPosts] = useState(0);
  const [totalExchangePosts, setTotalExchangePosts] = useState(0);
  const pageSize = 10;

  const fetchRequestDetails = async (requestIds, type) => {
    const requests = [];
    for (let id of requestIds) {
      try {
        const response = await callApi(`http://localhost:8000/requests/${type}/${id}`, 'get');
        if (response.data.status === 'Remained') {
          requests.push(response.data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} post with request_id ${id}:`, error);
      }
    }
    return requests;
  };

  const fetchRequests = async (type, currentPage) => {
    try {
      const response = await callApi(`http://localhost:8000/requests/${type}?page=${currentPage}&limit=${pageSize}`, 'get');
      const requestIds = response.data.request_list;
      const requests = await fetchRequestDetails(requestIds, type);
      return { requests, totalCount: response.data.total_count };
    } catch (error) {
      console.error(`Failed to fetch ${type} posts:`, error);
      return { requests: [], totalCount: 0 };
    }
  };

  const fetchSellRequests = async (page) => {
    const sellResponse = await fetchRequests('sell', page);
    setSellPosts(sellResponse.requests || []);
    setTotalSellPosts(sellResponse.totalCount || 0);
    setCurrentSellPage(page);
  };

  const fetchExchangeRequests = async (page) => {
    const exchangeResponse = await fetchRequests('exchange', page);
    setExchangePosts(exchangeResponse.requests || []);
    setTotalExchangePosts(exchangeResponse.totalCount || 0);
    setCurrentExchangePage(page);
  }

  const onSellPageChange = (page) => {
    fetchSellRequests(page);
  };

  const onExchangePageChange = (page) => {
    fetchExchangeRequests(page);
  };

  useEffect(() => {
    fetchSellRequests(currentSellPage);
    fetchExchangeRequests(currentExchangePage);
  }, []);

  const renderDetail = (record, type) => (
    <Link to={`${type}/${record.request_id}`}>
      <Button className='bg-blue-500' type="primary">
        Detail
      </Button>
    </Link>
  );

  const commonColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'Posted By',
      dataIndex: 'seller_name',
      key: 'seller_name',
    },
    {
      title: 'ISBN List',
      dataIndex: 'isbn_list',
      key: 'isbn_list',
      render: (isbnList) => isbnList.join(', '),
    },
    {
      title: 'Quantity List',
      dataIndex: 'no_of_copies_list',
      key: 'no_of_copies_list',
      render: (noOfCopiesList) => noOfCopiesList.join(', '),
    },
  ]
  
  const sellColumns = [
    ...commonColumns,
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'sell'),
    },
  ];

  const exchangeColumns = [
    ...commonColumns,
    {
      title: 'Wishlist',
      dataIndex: 'wishlist_description',
      key: 'wishlist_description',
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'exchange'),
    },
  ];

  return (
    <div className="container mx-auto mt-8">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Selling Requests" key="1">
          <Table dataSource={sellPosts} columns={sellColumns} rowKey="request_id" />
          <Pagination
            current={currentSellPage}
            onChange={onSellPageChange}
            total={totalSellPosts}
            pageSize={pageSize}
          />
        </TabPane>
        <TabPane tab="Exchange Requests" key="2">
          <Table dataSource={exchangePosts} columns={exchangeColumns} rowKey="request_id" />
          <Pagination
            current={currentExchangePage}
            onChange={onExchangePageChange}
            total={totalExchangePosts}
            pageSize={pageSize}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Home;
