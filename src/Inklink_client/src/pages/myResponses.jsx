import React, { useState, useEffect } from 'react';
import { Table, Button, Pagination, Input, Select } from 'antd';
import { callApi } from '../utils/axios_client';
import { Link } from 'react-router-dom';
import { useUser } from '../Usercontext';

const { Option } = Select;

const MyResponses = () => {
  const { user } = useUser();
  const [responses, setResponses] = useState([]);
  const [responseFilters, setResponseFilters] = useState({ status: 'All' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const pageSize = 10;

  const fetchResponseDetails = async (responseIds) => {
    const responses = [];
    for (let id of responseIds) {
      try {
        const response = await callApi(`http://localhost:8000/responses/${id}`, 'get');
        responses.push(response.data);
      } catch (error) {
        console.error(`Failed to fetch response with response_id ${id}:`, error);
      }
    }
    return responses;
  };

  const fetchResponses = async (page, filters) => {
    try {
      const queryParams = new URLSearchParams({ ...filters, page, limit: pageSize }).toString();
      const response = await callApi(`http://localhost:8000/responses/user/${user.userId}?${queryParams}`, 'get');
      const responseIds = response.data.response_list;
      const responses = await fetchResponseDetails(responseIds);
      return { responses, totalCount: response.data.total_count };
    } catch (error) {
      console.error(`Failed to fetch responses:`, error);
      return { responses: [], totalCount: 0 };
    }
  };

  const fetchMyResponses = async (page) => {
    const response = await fetchResponses(page, responseFilters);
    setResponses(response.responses || []);
    setTotalResponses(response.totalCount || 0);
    setCurrentPage(page);
  };

  const onFilterChange = (e) => {
    setResponseFilters({ ...responseFilters, [e.target.name]: e.target.value });
  };

  const onSearch = () => {
    setCurrentPage(1);
    fetchMyResponses(1);
  };

  const onPageChange = (page) => {
    fetchMyResponses(page);
  };

  useEffect(() => {
    fetchMyResponses(currentPage);
  }, []);

  const renderDetail = (record, type) => (
    <Link to={`../${type}/${record.request_id}`}>
      <Button className='bg-blue-500' type="primary">
        Detail
      </Button>
    </Link>
  );

  const renderStatusFilter = (filterState, onChange) => (
    <Select defaultValue="All" style={{ width: 120 }} onChange={(value) => onChange({ target: { name: 'status', value } })}>
      <Option value="All">All</Option>
      <Option value="Available">Available</Option>
      <Option value="Accepted">Accepted</Option>
      <Option value="Rejected">Rejected</Option>
      <Option value="Deleted">Deleted</Option>
    </Select>
  );

  const responseColumns = [
    {
        title: 'Response ID',
        dataIndex: 'response_id',
        key: 'response_id',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
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
    {
      title: 'Request Detail',
      key: 'detail',
      render: (text, record) => renderDetail(record, 'exchange'),
    },
  ];

  return (
    <div className="container mx-auto mt-8">
      <h1><strong>My Responses</strong></h1>
        <div>
        {renderStatusFilter(responseFilters, onFilterChange)}
        <Button onClick={onSearch}>Search</Button>
        </div>
        <Table dataSource={responses} columns={responseColumns} rowKey="response_id" />
        <Pagination
            current={currentPage}
            onChange={onPageChange}
            total={totalResponses}
            pageSize={pageSize}
        />
    </div>
  );
};

export default MyResponses;
