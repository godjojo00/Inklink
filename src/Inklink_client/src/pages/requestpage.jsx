import React, { useState, useEffect } from 'react';

const RequestPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // 在這裡發送 GET 請求獲取 request 資料
    // 可以使用 fetch 或其他 HTTP 請求庫（axios、ajax 等）

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/requests'); // 替換為實際的後端路徑
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Request Page</h1>
      <ul>
        {requests.map((request) => (
          <li key={request.request_id}>
            <p>Poster ID: {request.poster_id}</p>
            <p>Type: {request.is_type === 'sell' ? '販賣文' : '換書文'}</p>
            {request.is_type === 'sell' && (
              <p>Price: {request.selling_request?.price}</p>
            )}
            {request.is_type === 'exchange' && (
              <p>Wishlist Description: {request.exchange_request?.wishlist_description}</p>
            )}
            {request.is_type === 'sell' && request.selling_request && (
              <div>
                <p>ISBN: {request.selling_request.sell_exchange.isbn}</p>
                <p>No of Copies: {request.selling_request.sell_exchange.no_of_copies}</p>
                {/* 其他書本資訊 */}
              </div>
            )}
            {request.is_type === 'exchange' && request.exchange_request && (
              <div>
                <p>ISBN: {request.exchange_request.sell_exchange.isbn}</p>
                <p>No of Copies: {request.exchange_request.sell_exchange.no_of_copies}</p>
                {/* 其他書本資訊 */}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestPage;
