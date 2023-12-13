import React, { useState } from 'react';
import { Table, Input, Button, Pagination, Spin } from 'antd';
import { callApi } from '../utils/axios_client';

const BookSearchPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ title: '', author: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await callApi(
        `http://localhost:8000/books/books?book_title=${search.title}&author=${search.author}&page=${currentPage}`,
        'get'
      );
      setBooks(response.data.books);
      setTotalBooks(response.data.total); // Update this line based on your API's response
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Edition', dataIndex: 'edition_name', key: 'edition', render: text => text || 'N/A' },
    { title: 'Author', dataIndex: 'author_name', key: 'author' },
  ];

  const onSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const onSearch = () => {
    setCurrentPage(1);
    fetchBooks();
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
    fetchBooks();
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Book Search</h2>
      <div>
        <Input
          placeholder="Search by book title"
          name="title"
          value={search.title}
          onChange={onSearchChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Search by author"
          name="author"
          value={search.author}
          onChange={onSearchChange}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Button onClick={onSearch}>Search</Button>
      </div>
      {loading ? (
        <Spin />
      ) : (
        <Table dataSource={books} columns={columns} rowKey="isbn" pagination={false} />
      )}
      <Pagination
        current={currentPage}
        onChange={onPageChange}
        total={totalBooks}
        showSizeChanger={false}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
};

export default BookSearchPage;
