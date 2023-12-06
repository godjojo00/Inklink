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
        console.log('API response:', response);
        setRequestDetails(response.data);
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
      // Ensure user.userId is valid
      if (!user.userId) {
        console.error('Invalid user.userId:', user.userId);
        message.error('Failed to confirm purchase. User ID is invalid.');
        return;
      }
  
      // Call API to confirm purchase
      //const purchaseResponse = await callApi(`http://localhost:8000/requests/sell/${requestId}`, 'patch', {
      //requestId,user_id: user.userId,
      //});
  
      // Call API to get seller information
      const sellerInfoResponse = await callApi(`http://localhost:8000/users/${requestDetails.poster_id}`, 'get');
      setSellerInfo(sellerInfoResponse.data);
  
      setModalVisible(false); // Close the purchase confirmation modal
      setPurchaseSuccessModalVisible(true); // Show the purchase success modal
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
      title: 'ISBN List',
      dataIndex: 'isbn_list',
      key: 'isbn_list',
      render: (isbnList) => (isbnList ? isbnList.join(', ') : ''),
    },
    {
      title: 'Quantity',
      dataIndex: 'no_of_copies_list',
      key: 'no_of_copies_list',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sell Request Details</h2>
      <Table dataSource={[requestDetails]} columns={columns} rowKey="request_id" />
      <Button className='bg-blue-500' type="primary" onClick={showModal}>
        Confirm Purchase
      </Button>

      <Modal
        title={`Confirm Purchase - Request ID: ${requestDetails.request_id}`}
        visible={modalVisible}
        onOk={handlePurchaseConfirmation}
        onCancel={hideModal}
        okButtonProps={{ style: { backgroundColor: '#1d4ed8' } }}
      >
        {/* Display additional details or message in the modal */}
        <p>Are you sure you want to confirm this purchase?</p>
        {/* Add more details if needed */}
      </Modal>

      {/* Purchase Success Modal */}
      <Modal
        title="Purchase Success"
        visible={purchaseSuccessModalVisible}
        onOk={handlePurchaseSuccessModalOk}
        onCancel={handlePurchaseSuccessModalOk}
        okButtonProps={{ style: { backgroundColor: '#1d4ed8' } }}
      >
        {/* Display order details and seller information */}
        <p>Order ID: {requestDetails?.request_id}</p>
        <p>Order Total: {requestDetails?.price}</p>
        <p>Seller Email: {sellerInfo?.email}</p>
        <p>Seller Phone: {sellerInfo?.phone_number}</p>
        {/* Add more details if needed */}
      </Modal>
    </div>
  );
};

export default SellRequestDetail;
