import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { callApi } from '../utils/axios_client';
import { Button, Spin, Table, Modal, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useUser } from '../Usercontext';

const SellRequestDetail = () => {
  const { requestId } = useParams();
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseSuccessModalVisible, setPurchaseSuccessModalVisible] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await callApi(`http://localhost:8000/requests/sell/${requestId}`, 'get');
        const requestDetailsData = response.data;
    
        // Fetch additional book details using ISBN
        const bookDetailsPromises = requestDetailsData.isbn_list.map(async (isbn) => {
          try {
            const bookDetailsUrl = `http://localhost:8000/books/book?isbn=${isbn}`;
            const bookDetailsResponse = await callApi(bookDetailsUrl, 'get');
            return bookDetailsResponse.data;
          } catch (bookDetailsError) {
            console.error(`Failed to fetch book details for ISBN ${isbn}:`, bookDetailsError);
            // Handle the error as needed, e.g., return a default value
            return { isbn, title: 'N/A', author_list: ['N/A'] };
          }
        });
    
        const bookDetailsList = await Promise.all(bookDetailsPromises);
    
        // Combine book details with request details
        const detailedRequestDetails = {
          ...requestDetailsData,
          bookDetailsList,
        };
    
        setRequestDetails(detailedRequestDetails);
      } catch (error) {
        console.error(`Failed to fetch sell request details for request_id ${requestId}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchRequestDetails();
  }, [requestId]);
  

  const handlePurchaseConfirmation = async () => {
    try {
      if (!user.userId) {
        console.error('Invalid user.userId:', user.userId);
        message.error('Failed to confirm purchase. User ID is invalid.');
        return;
      }

      const purchaseResponse = await callApi(`http://localhost:8000/requests/buy/${requestId}?buyer_id=${user.userId}`, 'patch');
      const sellerInfoResponse = await callApi(`http://localhost:8000/users/${requestDetails.poster_id}`, 'get');
      setSellerInfo(sellerInfoResponse.data);

      setModalVisible(false);
      setPurchaseSuccessModalVisible(true);
      if (purchaseResponse.status === 201) {
        message.success('Purchase completed successfully!');
      }
    } catch (error) {
      console.error('Failed to confirm purchase:', error);
      if (error.detail && Array.isArray(error.detail)) {
        console.log('Validation Errors:', error.detail);
      }
      message.error('Failed to confirm purchase. Please try again.');
    }
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handlePurchaseSuccessModalOk = () => {
    setPurchaseSuccessModalVisible(false);
  };

  const handleDeleteRequest = async () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this request?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          const response = await callApi(`http://localhost:8000/requests/delete-sell/${requestId}?deleter_id=${user.userId}`, 'patch');
          if (response.status === 204) {
            message.success('Request deleted successfully!');
            setRequestDetails({ ...requestDetails, status: 'Deleted' });
          }
        } catch (error) {
          console.error('Failed to delete sell request:', error);
          message.error('Failed to delete the request. Please try again.');
        }
      },
    });
  };
  

  if (loading) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
  }

  if (!requestDetails) {
    return <div>Error: Unable to fetch sell request details.</div>;
  }

  const columns = [
    {
      title: 'Request ID',
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
      title: 'Author',
      dataIndex: 'bookDetailsList',
      key: 'bookAuthor',
      render: (text, record) => (
        <span>
          {record.bookDetailsList.map((book) => (
            <div key={book.isbn}>
              <strong></strong> {book.author_list.join(', ')}
            </div>
          ))}
        </span>
      ),
    },
    {
      title: 'Edition',
      dataIndex: 'bookDetailsList',
      key: 'bookEdition',
      render: (text, record) => (
        <span>
          {record.bookDetailsList.map((book) => (
            <div key={book.isbn}>
              <strong></strong> {book.edition_name}
            </div>
          ))}
        </span>
      ),
    },
    {
      title: 'ISBN List',
      dataIndex: 'isbn_list',
      key: 'isbn_list',
      render: (isbnList) => (isbnList ? isbnList.join(', ') : ''),
    },
    {
      title: 'Quantity',
      dataIndex: 'no_of_copies_list',
      key: 'no_of_copies_list',
      render: (no_of_copies_list) => (no_of_copies_list ? no_of_copies_list.join(', ') : ''),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },    
    // Add separate columns for each book detail
  ];
  
  // 然後在Table中將`bookDetailsList`排除在外:
  // 這是Table的一部分
  <Table
    dataSource={[{ ...requestDetails, key: requestDetails.request_id }]}
    columns={columns.filter((col) => col.dataIndex !== 'bookDetailsList')}
    rowKey="request_id"
  />
  
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sell Request Details</h2>
      <Table dataSource={[requestDetails]} columns={columns} rowKey="request_id" />
      {user.userId !== requestDetails.poster_id && requestDetails.status === 'Remained' && (
        <Button className='bg-blue-500' type="primary" onClick={showModal}>
          Confirm Purchase
        </Button>
      )}
      
      {user.userId === requestDetails.poster_id && requestDetails.status === 'Remained' && (
        <Button 
          className='bg-red-500 text-white' 
          type="danger" 
          onClick={handleDeleteRequest}
        >
          Delete Request
        </Button>
      )}

      <Modal
        title={`Confirm Purchase - Request ID: ${requestDetails.request_id}`}
        visible={modalVisible}
        onOk={handlePurchaseConfirmation}
        onCancel={hideModal}
        okButtonProps={{ style: { backgroundColor: '#1d4ed8' } }}
      >
        <p>Are you sure you want to confirm this purchase?</p>
      </Modal>

      <Modal
        title="Purchase Success"
        visible={purchaseSuccessModalVisible}
        onOk={handlePurchaseSuccessModalOk}
        onCancel={handlePurchaseSuccessModalOk}
        okButtonProps={{ style: { backgroundColor: '#1d4ed8' } }}
      >
        <p>Order ID: {requestDetails?.request_id}</p>
        <p>Order Total: {requestDetails?.price}</p>
        <p>Seller ID: {sellerInfo?.user_id}</p>
        <p>Seller Email: {sellerInfo?.email}</p>
        <p>Seller Phone: {sellerInfo?.phone_number}</p>
        <p>Book Details:</p>
        <ul>
          {requestDetails?.bookDetailsList.map((book) => (
            <li key={book.isbn}>
              <strong>Title:</strong> {book.title} <br />
              <strong>Author:</strong> {book.author_list.join(', ')} <br />
              <strong>Edition:</strong> {book.edition_name} <br />
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default SellRequestDetail;
