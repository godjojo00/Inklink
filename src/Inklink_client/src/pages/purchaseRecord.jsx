import React, { useEffect, useState } from 'react';
import { callApi } from '../utils/axios_client';
import { Table, Spin, Button, Modal, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useUser } from '../Usercontext';

const PurchaseRecord = () => {
  const [purchaseRecords, setPurchaseRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null); // 添加了卖家信息的状态
  const { user } = useUser();

  useEffect(() => {
    const fetchPurchaseRecords = async () => {
      try {
        if (!user.userId) {
          console.error('Invalid user.userId:', user.userId);
          message.error('Failed to fetch purchase records. User ID is invalid.');
          return;
        }

        const response = await callApi(`http://localhost:8000/requests/sell?status=Accepted&buyer_id=${user.userId}`, 'get');
        const purchaseRequestList = response.data.sell_request_list;

        const detailedPurchaseRecords = await Promise.all(
          purchaseRequestList.map(async (purchaseRequestId) => {
            try {
              const purchaseRequestUrl = `http://localhost:8000/requests/sell/${purchaseRequestId}`;
              const purchaseRequestResponse = await callApi(purchaseRequestUrl, 'get');
              const purchaseRequestData = purchaseRequestResponse.data;

              if (purchaseRequestData.buyer_id !== user.userId) {
                return null;
              }

              const bookDetailsPromises = purchaseRequestData.isbn_list.map(async (isbn) => {
                try {
                  const bookDetailsUrl = `http://localhost:8000/books/book?isbn=${isbn}`;
                  const bookDetailsResponse = await callApi(bookDetailsUrl, 'get');
                  return bookDetailsResponse.data;
                } catch (bookDetailsError) {
                  console.error(`Failed to fetch book details for ISBN ${isbn}:`, bookDetailsError);
                  return { isbn, title: 'N/A', author_list: ['N/A'] };
                }
              });

              const bookDetailsList = await Promise.all(bookDetailsPromises);

              return {
                ...purchaseRequestData,
                bookDetailsList,
              };
            } catch (error) {
              console.error(`Failed to fetch purchase details for request ID ${purchaseRequestId}:`, error);
              return null;
            }
          })
        );

        const filteredPurchaseRecords = detailedPurchaseRecords.filter(record => record !== null);
        setPurchaseRecords(filteredPurchaseRecords);
      } catch (error) {
        console.error('Failed to fetch purchase records:', error);
        message.error('Failed to fetch purchase records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseRecords();
  }, [user.userId]);

  const fetchSellerInfo = async (posterId) => {
    try {
      const sellerInfoResponse = await callApi(`http://localhost:8000/users/${posterId}`, 'get');
      setSellerInfo(sellerInfoResponse.data);
    } catch (error) {
      console.error(`Failed to fetch seller details for poster ID ${posterId}:`, error);
    }
  };

  const showModal = async (purchaseDetails) => {
    setPurchaseDetails(purchaseDetails);
    setModalVisible(true);

    // Fetch seller information
    if (purchaseDetails && purchaseDetails.poster_id) {
      await fetchSellerInfo(purchaseDetails.poster_id);
    }
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const columns = [
    {
      title: 'Orders ID',
      dataIndex: 'request_id',
      key: 'request_id',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Book Title',
      dataIndex: 'bookDetailsList',
      key: 'bookTitle',
      render: (text, record) => (
        <span>
          {record.bookDetailsList.map((book) => (
            <div key={book.isbn}>
              <strong></strong> {book.title}
            </div>
          ))}
        </span>
      ),
    },
    {
      title: 'Order Creation Time',
      dataIndex: 'buying_time',
      key: 'buying_time',
    },
    {
      title: 'Seller Info',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => showModal(record)}>View Details</Button>
      ),
    },
  ];

  const sortedPurchaseRecords = purchaseRecords.sort((a, b) => {
    const timeA = new Date(a.buying_time).getTime();
    const timeB = new Date(b.buying_time).getTime();
    return timeB - timeA;
  });

  if (loading) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">這是您的訂單記錄：</h2>
      <Table dataSource={sortedPurchaseRecords} columns={columns} rowKey="request_id" />

      <Modal
        title={`Purchase Details - Request ID: ${purchaseDetails?.request_id}`}
        visible={modalVisible}
        onCancel={hideModal}
        footer={[
          <Button key="back" onClick={hideModal}>
            Close
          </Button>,
        ]}
      >
        <p>Order ID: {purchaseDetails?.request_id}</p>
        <p>Order Total: {purchaseDetails?.price}</p>
        <p>Seller ID: {sellerInfo?.user_id}</p>
        <p>Seller Email: {sellerInfo?.email}</p>
        <p>Seller Phone: {sellerInfo?.phone_number}</p>
      </Modal>
    </div>
  );
};

export default PurchaseRecord;
