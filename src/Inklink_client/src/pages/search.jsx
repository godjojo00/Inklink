import React, { useState } from 'react';
import { Table, Input, Button, message } from 'antd';
import { callApi } from '../utils/axios_client';
import { Link } from 'react-router-dom';

const ExchangeSearch = () => {
  const [sellerName, setSellerName] = useState('');
  const [priceLimit, setPriceLimit] = useState('');
  const [userName, setuserName] = useState('');
  const [exchangeData, setExchangeData] = useState([]);
  const [sellData, setSellData] = useState([]);


  const renderDetail = (record, type) => (
    <Link to={`/${type}/${record.request_id}`}>
      <Button className='bg-blue-500' type="primary">
        Detail
      </Button>
    </Link>
  );

  const handleDetailClick = (record, type) => {
    console.log(`Detail clicked for ${type} request ID: ${record.request_id}`);
  };

  const columnsCommon = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'Book Title', // 新增這個欄位
      dataIndex: 'book_title',
      key: 'book_title',
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
      render: (noOfCopiesList) => noOfCopiesList.join(', '),
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'exchange'),
    },
  ];

  const sellColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'Book Title', // 新增這個欄位
      dataIndex: 'book_title',
      key: 'book_title',
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
      render: (noOfCopiesList) => noOfCopiesList.join(', '),
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'sell'),
    },
  ];

  const exchangeColumns = [
    {
      title: 'Request ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'Book Title', // 新增這個欄位
      dataIndex: 'book_title',
      key: 'book_title',
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
      render: (noOfCopiesList) => noOfCopiesList.join(', '),
    },
    {
      title: 'Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'exchange'),
    },
  ];

  const fetchBookInfo = async (isbn) => {
    try {
      const apiUrl = `http://localhost:8000/books/book?isbn=${isbn}`;
      const response = await callApi(apiUrl, 'get');
      const bookInfo = response.data;

      // 這裡可以根據 API 的回傳結構進行資料處理
      console.log('Book Info:', bookInfo);

      return bookInfo;
    } catch (error) {
      console.error('Failed to fetch book info:', error);
      message.error('Failed to fetch book info. Please try again.');
      return null;
    }
  };



  const searchExchange = async () => {
    try {
      // Check if priceLimit is provided
      if (priceLimit.trim() !== '') {
        throw new Error('Price limit should not be provided for exchange search.');
      }

      const params = new URLSearchParams();
      if (sellerName) {
        params.append('book_title', sellerName);
      }
      
      if (userName) {
        params.append('seller_name', userName); 
      }
      // No need to append price_limit if not provided

      const queryString = params.toString();
      const apiUrl = `http://localhost:8000/requests/exchange?${queryString}`;
      const response = await callApi(apiUrl, 'get');
      const exchangeRequestList = response.data.exchange_request_list;

      const detailedExchangeData = await Promise.all(
        exchangeRequestList.map(async (exchangeRequestId) => {
          const exchangeRequestUrl = `http://localhost:8000/requests/exchange/${exchangeRequestId}`;
          const exchangeRequestResponse = await callApi(exchangeRequestUrl, 'get');
          const exchangeRequestData = exchangeRequestResponse.data;

          // 根據 API 的回傳結構取得 ISBN
          const isbn = exchangeRequestData.isbn_list[0]; // 假設這裡只有一個 ISBN

          // 使用 fetchBookInfo 方法獲取書籍資訊
          const bookInfo = await fetchBookInfo(isbn);

          return {
            request_id: exchangeRequestData.request_id,
            isbn_list: exchangeRequestData.isbn_list,
            no_of_copies_list: exchangeRequestData.no_of_copies_list,
            wishlist_description: exchangeRequestData.wishlist_description,
            book_title: bookInfo?.title || 'N/A', // 如果沒有取到書名，顯示 'N/A'
            key: exchangeRequestData.request_id,
          };
        })
      );

      setExchangeData(detailedExchangeData);
      setSellData([]); // Clear sellData
    } catch (error) {
      console.error('Failed to fetch exchange data:', error);
      message.error(error.message || 'Failed to fetch exchange data. Please try again.');
    }
  };
  
  const searchSell = async () => {
    try {
      const params = new URLSearchParams();
      if (sellerName) {
        params.append('book_title', sellerName);
      }
      if (userName) {
        params.append('seller_name', userName); 
      }
      if (priceLimit) {
        params.append('price_limit', priceLimit);
      }

      params.append('status', 'Remained');
      const queryString = params.toString();
      const apiUrl = `http://localhost:8000/requests/sell?${queryString}`;

      const response = await callApi(apiUrl, 'get');
      const sellRequestList = response.data.sell_request_list;

      const detailedSellData = await Promise.all(
        sellRequestList.map(async (sellRequestId) => {
          const sellRequestUrl = `http://localhost:8000/requests/sell/${sellRequestId}`;
          const sellRequestResponse = await callApi(sellRequestUrl, 'get');
          const sellRequestData = sellRequestResponse.data;

          // 根據 API 的回傳結構取得 ISBN
          const isbn = sellRequestData.isbn_list[0]; // 假設這裡只有一個 ISBN

          // 使用 fetchBookInfo 方法獲取書籍資訊
          const bookInfo = await fetchBookInfo(isbn);

          return {
            request_id: sellRequestData.request_id,
            isbn_list: sellRequestData.isbn_list,
            no_of_copies_list: sellRequestData.no_of_copies_list,
            price: sellRequestData.price,
            book_title: bookInfo?.title || 'N/A', // 如果沒有取到書名，顯示 'N/A'
            key: sellRequestData.request_id,
          };
        })
      );

      setSellData(detailedSellData);
      setExchangeData([]); // Clear exchangeData
    } catch (error) {
      console.error('Failed to fetch sell data:', error);
      message.error('Failed to fetch sell data. Please try again.');
    }
  };

  const resetSearch = () => {
    setExchangeData([]);
    setSellData([]);
    setSellerName('');
    setPriceLimit('');
    setuserName('');
  };

  // Determine whether to show search form based on results
  const showSearchForm = exchangeData.length === 0 && sellData.length === 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {showSearchForm && (
        <>
          <h2 className="text-2xl font-bold mb-4">Search for Sell or Exchange Requests</h2>
          <Input
            placeholder="Enter Book's title"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            style={{ width: '300px', marginBottom: '0.5rem' }}
          />
          <Input
            placeholder="Enter Price Limit (Only for sell request)"
            value={priceLimit}
            onChange={(e) => setPriceLimit(e.target.value)}
            style={{ width: '300px', marginBottom: '0.5rem' }}
          />
          <Input
            placeholder="Enter Seller's Name"
            value={userName}
            onChange={(e) => setuserName(e.target.value)}
            style={{ width: '300px', marginBottom: '0.5rem' }}
          />
          

          <Button
            className='w-80 bg-blue-500 hover.bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2'
            onClick={searchExchange}
          >
            Search For Exchange
          </Button>
          <Button
            className='w-80 bg-blue-500 hover.bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={searchSell}
          >
            Search For Sell
          </Button>
        </>
      )}
    
      {exchangeData.length > 0 && (
        <div className="mt-80">
          <h2 className="text-xl font-bold mt-40">Exchange Requests</h2>
          {/* 顯示 Exchange Requests 的 Table */}
          <Table dataSource={exchangeData} columns={exchangeColumns} rowKey="request_id" pagination={{ pageSize: 10 }}  style={{ marginTop: '80px' }} />
        </div>
      )}

      {sellData.length > 0 && (
        <div className="mt-80">
          <h2 className="text-xl font-bold mt-20">Sell Requests</h2>
          {/* 顯示 Sell Requests 的 Table */}
          <Table dataSource={sellData} columns={sellColumns} rowKey="request_id" pagination={{ pageSize: 10 }}  style={{ marginTop: '20px' }} />
        </div>
      )}
      
      {(exchangeData.length > 0 || sellData.length > 0) && (
        <Button
          className='w-80 bg-gray-500 hover.bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 mb-40'
          onClick={resetSearch}
        >
          Search again
        </Button>
      )}
    </div>
  );
};

export default ExchangeSearch;