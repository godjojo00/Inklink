import React, { useState } from 'react';
import { Table, Input, Button, Spin } from 'antd';
import { callApi } from '../utils/axios_client';

const SellAnalysisPage = () => {
  const [sellData, setSellData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    isbn: '',
    book_title: '',
    author_name: '',
    seller_name: '',
    price_limit: '',
    status: 'All',
    post_before: '',
    post_after: '',
    descending: true,
  });

  const fetchSellData = async () => {
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
        `http://localhost:8000/admins/sell-analysis/books?${queryString}`,
        'get'
      );

      // 获取书籍信息
      const updatedSellData = await Promise.all(
        response.data.map(async (sellItem) => {
          try {
            const bookInfo = await callApi(
              `http://localhost:8000/books/book?isbn=${sellItem.isbn}`,
              'get'
            );
            return { ...sellItem, bookInfo: bookInfo.data };
          } catch (error) {
            console.error(`Failed to fetch book info for ISBN ${sellItem.isbn}:`, error);
            return sellItem;
          }
        })
      );

      setSellData(updatedSellData);
    } catch (error) {
      console.error('Failed to fetch sell data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
    { title: 'Average Price', dataIndex: 'avg_price', key: 'avg_price' },
    { title: 'Total Quantity', dataIndex: 'total_quantity', key: 'total_quantity' },
    // 新增书籍信息列
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

  const onFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const onCheckboxChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.checked });
  };

  const onFetchSellData = () => {
    fetchSellData();
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Analyze Sell Requests</h2>
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
          placeholder="Price Limit"
          name="price_limit"
          type="number"
          value={filters.price_limit}
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
        <Button onClick={onFetchSellData}>Search</Button>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <Table dataSource={sellData} columns={columns} rowKey="isbn" pagination={false} />
      )}
    </div>
  );
};

export default SellAnalysisPage;
