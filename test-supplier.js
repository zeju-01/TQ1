const axios = require('axios');

async function testCreateSupplier() {
  try {
    const response = await axios.post('http://localhost:3000/api/suppliers', {
      company_name: '测试供应商',
      contact_person: '联系人',
      phone: '12345678901'
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testCreateSupplier();