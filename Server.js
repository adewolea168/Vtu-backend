const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// VTpass Sandbox Configuration
const VTPASS_API_KEY = process.env.VTPASS_API_KEY; 
const BASE_URL = "https://sandbox.vtpass.com/api"; 

// 1. Fetch Data Plans Endpoint
app.get('/api/plans', async (req, res) => {
  try {
    const network = req.query.network || 'mtn-data';
    const response = await axios.get(`${BASE_URL}/service-variations?serviceID=${network}`);
    res.json(response.data.content.varations);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch plans" });
  }
});

// 2. Buy Data / Airtime Endpoint
app.post('/api/buy', async (req, res) => {
  const { phone, network, variationCode, amount } = req.body;
  const requestId = `TXN_${Date.now()}`;

  try {
    const response = await axios.post(`${BASE_URL}/pay`, {
      request_id: requestId,
      serviceID: network,       
      billersCode: phone,        
      variation_code: variationCode, 
      amount: amount,            
      phone: phone
    }, {
      headers: {
        'api-key': VTPASS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.code === '000') {
      res.json({ success: true, message: "Top-up successful!", data: response.data });
    } else {
      res.status(400).json({ success: false, message: response.data.response_description });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error or network issue" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
