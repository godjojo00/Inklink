import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { callApi } from '../utils/axios_client';

const CreateBookForm = () => {
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    subtitle: '',
    edition_name: '',
    author_list: [''], // 初始一個作者
  });

  const onInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const onAuthorChange = (index, value) => {
    const updatedAuthors = [...formData.author_list];
    updatedAuthors[index] = value;
    setFormData({ ...formData, author_list: updatedAuthors });
  };

  const onAddAuthor = () => {
    setFormData({ ...formData, author_list: [...formData.author_list, ''] });
  };

  const onRemoveAuthor = (index) => {
    const updatedAuthors = [...formData.author_list];
    updatedAuthors.splice(index, 1);
    setFormData({ ...formData, author_list: updatedAuthors });
  };

  const onSubmit = async () => {
    try {
      const response = await callApi('http://localhost:8000/books/', 'post', formData);
      if (response.status === 201) {
        message.success('Successfully created');
        // 清空表單
        setFormData({
          isbn: '',
          title: '',
          subtitle: '',
          edition_name: '',
          author_list: [''],
        });
      } else {
        message.error('Error');
      }
    } catch (error) {
      console.error('Failed to create book:', error);
      message.error('Error: ' + error.detail);
    }
  };
  

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Book</h2>
      <div>
        <Input
          placeholder="ISBN"
          value={formData.isbn}
          onChange={(e) => onInputChange('isbn', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Subtitle"
          value={formData.subtitle}
          onChange={(e) => onInputChange('subtitle', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        <Input
          placeholder="Edition Name"
          value={formData.edition_name}
          onChange={(e) => onInputChange('edition_name', e.target.value)}
          style={{ margin: '0 10px 10px 0' }}
        />
        {formData.author_list.map((author, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <Input
              placeholder={`Author ${index + 1}`}
              value={author}
              onChange={(e) => onAuthorChange(index, e.target.value)}
              style={{ margin: '0 10px 10px 0' }}
            />
            <Button onClick={() => onRemoveAuthor(index)}>Remove</Button>
          </div>
        ))}
        <Button onClick={onAddAuthor}>Add Author</Button>
        <Button onClick={onSubmit}>Submit</Button>
      </div>
    </div>
  );
};

export default CreateBookForm;