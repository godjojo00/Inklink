import React, { useState } from 'react';
import { Table, Input, Button, Spin, Select } from 'antd';
import { callApi } from '../utils/axios_client';

const { Option } = Select;

const ExchangeAnalysisPage = () => {
  const [exchangeData, setExchangeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    isbn: '',
    book_title: '',
    author_name: '',
    seller_name: '',
    description: '',
    status: 'All', // Default status is set to "All"
    post_before: '',
    post_after: '',
    descending: true,
  });

  const fetchExchangeData = async () => {
    setLoading(true);
    try {
      const queryString = Object.entries(filters)
        .filter(([key, value]) => value !== '')
        .map(([key, value]) => {
          if (key === 'post_before' || key === 'post_after') {
            // Convert date to string format
            const formattedDate = value.replace(/[-T:]/g, '');
            return `${key}=${encodeURIComponent(new Date(value).toISOString())}`;
          }
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');

      const response = await callApi(
        `http://localhost:8000/admins/exchange-analysis/books?${queryString}`,
        'get'
      );

      // 获取书籍信息
      const updatedExchangeData = await Promise.all(
        response.data.map(async (exchangeItem) => {
          try {
            const bookInfo = await callApi(
              `http://localhost:8000/books/book?isbn=${exchangeItem.isbn}`,
              'get'
            );
            return { ...exchangeItem, bookInfo: bookInfo.data };
          } catch (error) {
            console.error(`Failed to fetch book info for ISBN ${exchangeItem.isbn}:`, error);
            return exchangeItem;
          }
        })
      );

      setExchangeData(updatedExchangeData);
    } catch (error) {
      console.error('Failed to fetch exchange data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
    { title: 'Total Quantity', dataIndex: 'total_quantity', key: 'total_quantity' },
    // 新增書本資訊列
    {
      title: 'Book Info',
      dataIndex: 'bookInfo',
      key: 'bookInfo',
      render: (text, record) => (
        <div>
          <p>Title: {text.title}</p>
          <p>Author: {text.author_list.join(', ')}</p>
          <p>Edition_ID: {text.edition_id}</p>
        </div>
      ),
    },
  ];

  const onFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const onCheckboxChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.checked });
  };

  const onFetchExchangeData = () => {
    fetchExchangeData();
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Analyze Exchange Requests</h2>
      <div>
        <Input
          placeholder="ISBN"
          name="isbn"
          value={filters.isbn}
          onChange={(e) => onFilterChange('isbn', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Book Title"
          name="book_title"
          value={filters.book_title}
          onChange={(e) => onFilterChange('book_title', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Author Name"
          name="author_name"
          value={filters.author_name}
          onChange={(e) => onFilterChange('author_name', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Seller Name"
          name="seller_name"
          value={filters.seller_name}
          onChange={(e) => onFilterChange('seller_name', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Description"
          name="description"
          value={filters.description}
          onChange={(e) => onFilterChange('description', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Post Before"
          name="post_before"
          type="date"
          value={filters.post_before}
          onChange={(e) => onFilterChange('post_before', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Post After"
          name="post_after"
          type="date"
          value={filters.post_after}
          onChange={(e) => onFilterChange('post_after', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
  
        <Select
          style={{ width: 120, margin: '0 10px 10px 0' }}
          placeholder="Status"
          onChange={(value) => onFilterChange('status', value)}
          value={filters.status}
        >
          <Option value="All">All</Option>
          <Option value="Remained">Remained</Option>
          <Option value="Accepted">Accepted</Option>
          <Option value="Deleted">Deleted</Option>
        </Select>
        <label>
          <input
            type="checkbox"
            name="descending"
            checked={filters.descending}
            onChange={onCheckboxChange}
          />
          Descending
        </label>
        <Button onClick={onFetchExchangeData}>Search</Button>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <Table dataSource={exchangeData} columns={columns} rowKey="isbn" pagination={false} />
      )}
    </div>
  );
};

export default ExchangeAnalysisPage;
