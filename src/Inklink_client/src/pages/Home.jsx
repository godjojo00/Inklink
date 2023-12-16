import React, { useState, useEffect } from 'react';
import { Alert, Table, Button, Pagination, Tabs, Input, Select } from 'antd';
import { callApi } from '../utils/axios_client';
import { Link } from 'react-router-dom';
import { useUser } from '../Usercontext';

const { TabPane } = Tabs;
const { Option } = Select;

const Home = () => {
  const [sellPosts, setSellPosts] = useState([]);
  const [exchangePosts, setExchangePosts] = useState([]);
  const [sellFilters, setSellFilters] = useState({ book_title: '', seller_name: '', price_limit: null });
  const [exchangeFilters, setExchangeFilters] = useState({ book_title: '', seller_name: '', description: '' });
  const [currentSellPage, setCurrentSellPage] = useState(1);
  const [currentExchangePage, setCurrentExchangePage] = useState(1);
  const [totalSellPosts, setTotalSellPosts] = useState(0);
  const [totalExchangePosts, setTotalExchangePosts] = useState(0);
  const pageSize = 10;
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState('Remained');

  const fetchRequestDetails = async (requestIds, type) => {
    const requests = [];
    for (let id of requestIds) {
      try {
        const response = await callApi(`http://localhost:8000/requests/${type}/${id}`, 'get');
        requests.push(response.data);
      } catch (error) {
        console.error(`Failed to fetch ${type} post with request_id ${id}:`, error);
      }
    }
    return requests;
  };

  const fetchRequests = async (type, page, filters) => {
    try {
      const statusQueryParam = user && user.role === 'admin' && statusFilter !== 'Remained' ? { status: statusFilter } : {};
      const filteredFilters = Object.fromEntries(
        Object.entries({ ...filters, ...statusQueryParam }).filter(([key, value]) => value !== null && value !== '')
      );
      const queryParams = new URLSearchParams({ ...filteredFilters, page, limit: pageSize }).toString();
      const response = await callApi(`http://localhost:8000/requests/${type}?${queryParams}`, 'get');
      const requestIds = response.data.request_list;
      const requests = await fetchRequestDetails(requestIds, type);
      return { requests, totalCount: response.data.total_count };
    } catch (error) {
      console.error(`Failed to fetch ${type} posts:`, error);
      return { requests: [], totalCount: 0 };
    }
  };

  const fetchSellRequests = async (page) => {
    const sellResponse = await fetchRequests('sell', page, sellFilters);
    setSellPosts(sellResponse.requests || []);
    setTotalSellPosts(sellResponse.totalCount || 0);
    setCurrentSellPage(page);
  };

  const fetchExchangeRequests = async (page) => {
    const exchangeResponse = await fetchRequests('exchange', page, exchangeFilters);
    setExchangePosts(exchangeResponse.requests || []);
    setTotalExchangePosts(exchangeResponse.totalCount || 0);
    setCurrentExchangePage(page);
  };

  const onSellFilterChange = (e) => {
    setSellFilters({ ...sellFilters, [e.target.name]: e.target.value });
  };

  const onExchangeFilterChange = (e) => {
    setExchangeFilters({ ...exchangeFilters, [e.target.name]: e.target.value });
  };

  const onSellSearch = () => {
    setCurrentSellPage(1);
    fetchSellRequests(1);
  };

  const onExchangeSearch = () => {
    setCurrentExchangePage(1);
    fetchExchangeRequests(1);
  };

  const onSellPageChange = (page) => {
    fetchSellRequests(page);
  };

  const onExchangePageChange = (page) => {
    fetchExchangeRequests(page);
  };

  const onStatusChange = (value) => {
    setStatusFilter(value);
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
      <h1><strong>{user && user.role === 'admin' ? statusFilter : "Remained"} Requests</strong></h1>
      <Alert
        message="Note: Poster name search looks for only exact matches."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      {user && user.role === 'admin' && (
        <div style={{ marginBottom: 20 }}>
          <Select defaultValue="Remained" style={{ width: 120 }} onChange={onStatusChange}>
            <Option value="All">All</Option>
            <Option value="Remained">Remained</Option>
            <Option value="Accepted">Accepted</Option>
            <Option value="Deleted">Deleted</Option>
          </Select>
        </div>
      )}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Selling Requests" key="1">
          <div>
            <Input
              placeholder="Search by book title"
              name="book_title"
              value={sellFilters.book_title}
              onChange={onSellFilterChange}
              style={{ margin: '0 10px 10px 0' }}
            />
            <Input
              placeholder="Search by poster name"
              name="seller_name"
              value={sellFilters.seller_name}
              onChange={onSellFilterChange}
              style={{ margin: '0 10px 10px 0' }}
            />
            <Input
              placeholder="Search by price limit"
              name="price_limit"
              value={sellFilters.price_limit}
              onChange={onSellFilterChange}
              style={{ margin: '0 10px 10px 0' }}
              type="number"
            />
            <Button onClick={onSellSearch}>Search</Button>
          </div>
          <Table dataSource={sellPosts} columns={sellColumns} rowKey="request_id" />
          <Pagination
            current={currentSellPage}
            onChange={onSellPageChange}
            total={totalSellPosts}
            pageSize={pageSize}
            showSizeChanger={false}
          />
        </TabPane>
        <TabPane tab="Exchange Requests" key="2">
          <div>
            <Input
              placeholder="Search by book title"
              name="book_title"
              value={exchangeFilters.book_title}
              onChange={onExchangeFilterChange}
              style={{ margin: '0 10px 10px 0' }}
            />
            <Input
              placeholder="Search by poster name"
              name="seller_name"
              value={exchangeFilters.seller_name}
              onChange={onExchangeFilterChange}
              style={{ margin: '0 10px 10px 0' }}
            />
            <Input
              placeholder="Search by wishlist description"
              name="description"
              value={exchangeFilters.description}
              onChange={onExchangeFilterChange}
              style={{ margin: '0 10px 10px 0' }}
            />
            <Button onClick={onExchangeSearch}>Search</Button>
          </div>
          <Table dataSource={exchangePosts} columns={exchangeColumns} rowKey="request_id" />
          <Pagination
            current={currentExchangePage}
            onChange={onExchangePageChange}
            total={totalExchangePosts}
            pageSize={pageSize}
            showSizeChanger={false}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Home;
