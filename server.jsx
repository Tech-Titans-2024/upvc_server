require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const category = require('./models/category');
const product = require('./models/products');

const app = express();

app.use(express.json());
app.use(cors(
{
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true,
}))

// ------------------------------------------------------------------------------------------------------------------

// Connect to MongoDB

mongoose
	.connect(process.env.DATABASE_URL)
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => console.error('Failed to Connect to MongoDB:', err));

// ------------------------------------------------------------------------------------------------------------------

// Start the 

const port = process.env.PORT || 5001;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
})

// ------------------------------------------------------------------------------------------------------------------

// Route to Fetch Types of Doors and Windows

app.get('/doorTypes', async (req, res) => {

    try {
        const productId = await product.findOne({ product_name: 'Door' });
        const productTypes = await category.find({ product_id: productId.product_id }, 'type');
        const uniqueProductTypes = [...new Set(productTypes.map((type) => type.type))];
        res.json(uniqueProductTypes);
    } 
	catch (error) {
        console.error("Error fetching Door Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

app.get('/windowTypes', async (req, res) => {

    try {
        const productId = await product.findOne({ product_name: 'Window' });
        const productTypes = await category.find({ product_id: productId.product_id }, 'type');
        const uniqueProductTypes = [...new Set(productTypes.map((type) => type.type))];
        res.json(uniqueProductTypes);
    } 
	catch (error) {
        console.error("Error fetching Window Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

// ------------------------------------------------------------------------------------------------------------------

// Fetch Varients for Door, Window

app.post('/varientTypes', async (req, res) => {

    const { selected_type, selected_category } = req.body;

    try 
	{
        let varientTypes = [];
        if (selected_category === 'Door') {
            varientTypes = await category.find({ type: selected_type }, 'varient');
        } 
		else if (selected_category === 'Window') {
            varientTypes = await category.find({ type: selected_type }, 'varient');
        }
        console.log(varientTypes)

        res.json(varientTypes);
    } 
	catch (error) {
        console.error("Error fetching Varient Types: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

// ------------------------------------------------------------------------------------------------------------------

// Fetch Varients for Louvers

app.get('/louverVarients', async (req, res) => {

    try {
        const productId = await product.findOne({ product_name: 'Louvers' });
        const productTypes = await category.find({ product_id: productId.product_id }, 'varient');
        const uniqueProductTypes = [...new Set(productTypes.map((varient) => varient.varient))];
        res.json(uniqueProductTypes);
    } 
	catch (error) {
        console.error("Error fetching Louver Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
	
})