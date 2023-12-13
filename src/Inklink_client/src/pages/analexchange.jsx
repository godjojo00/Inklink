import React, { useState } from 'react';
import { Table, Input, Button, Spin } from 'antd';
import { callApi } from '../utils/axios_client';

const ExchangeAnalysisPage = () => {
  const [exchangeData, setExchangeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    isbn: '',
    book_title: '',
    author_name: '',
    seller_name: '',
    description: '',
    status: 'All',
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

      setExchangeData(response.data);
    } catch (error) {
      console.error('Failed to fetch exchange data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
    { title: 'Total Quantity', dataIndex: 'total_quantity', key: 'total_quantity' },
  ];

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
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
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Book Title"
          name="book_title"
          value={filters.book_title}
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Author Name"
          name="author_name"
          value={filters.author_name}
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Seller Name"
          name="seller_name"
          value={filters.seller_name}
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Description"
          name="description"
          value={filters.description}
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Post Before"
          name="post_before"
          type="date"
          value={filters.post_before}
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Post After"
          name="post_after"
          type="date"
          value={filters.post_after}
          onChange={onFilterChange}
          style={{ margin: '0 10px 10px 0' }}
        />
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