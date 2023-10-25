import React, { useState } from 'react';

const IdentityVerificationPage = () => {
  // 表單資料的狀態
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    idNumber: '',
    issueDate: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // 處理表單資料變化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 假设验证结果保存在变量 isPassed 中
    const isPassed = true; // 或者从验证逻辑中获取

    // 跳转到结果页面，并传递表单数据和验证结果
    history.push('/verification-result', { formData, isPassed });
    // 在这里处理表单提交，包括 formData 和 selectedFile
    console.log('Form Data:', formData);
    console.log('Selected File:', selectedFile);

    // 可以使用 FormData 对象将文件上传到服务器
    const formDataForUpload = new FormData();
    formDataForUpload.append('name', formData.name);
    formDataForUpload.append('address', formData.address);
    formDataForUpload.append('idNumber', formData.idNumber);
    formDataForUpload.append('issueDate', formData.issueDate);
    formDataForUpload.append('idImage', selectedFile);

    // 在这里将 formDataForUpload 发送到服务器

    // 清空表单和文件选择
    setFormData({
      name: '',
      address: '',
      idNumber: '',
      issueDate: '',
    });
    setSelectedFile(null);
  };
  const isValidIdNumber = (value) => {
    // 正規表達式範例（需根據實際格式調整）
    const regex = /^[A-Z][0-9]{9}$/;
    return regex.test(value);
  };

  return (
    <div className="flex items-start h-screen">
      <div className="flex-1 d-flex align-items-stretch">
        {/* 左邊的表單 */}
        <div className="w-1/2 p-4" style={{ marginLeft: '20rem', paddingTop: '10rem' }}>
          <h1 className="text-xl font-semibold">身分驗證</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2" style={{ fontWeight: 'bold' }}>姓名：</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="border rounded px-2 py-1 w-full"
              />
              <label className="block mb-2" style={{ fontWeight: 'bold' }}>戶籍地：</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="border rounded px-2 py-1 w-full"
              />
              <label className="block mb-2" style={{ fontWeight: 'bold' }}>身分證字號：</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleFormChange}
                className={`border rounded px-2 py-1 w-full ${isValidIdNumber(formData.idNumber) ? 'border-green-500' : 'border-red-500'
                  }`}
              />
              <label className="block mb-2" style={{ fontWeight: 'bold' }}>發證日期：</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleFormChange}
                className="border rounded px-2 py-1 w-full"
              />
            </div>


          </form>
        </div>
      </div>
      <button type="submit" className="bg-white text-black px-4 py-2 rounded" style={{ marginTop: '30rem', border: '1px solid black' }}>
        送出資料
      </button>
      <div className="flex-1 d-flex align-items-stretch" style={{ paddingTop: '10rem' }}>
        {/* 右邊的身分證照片上傳區域 */}
        <div className="w-1/2 p-4">
          <h1 className="text-xl font-semibold">上傳身分證照片</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              name="idImage"
              onChange={handleFileChange}
              className="border rounded px-30 py-20 w-full"
            />
          </form>
        </div>
      </div>

    </div>
  );
};

export default IdentityVerificationPage;
