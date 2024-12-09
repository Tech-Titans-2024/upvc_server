require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const products = require('./models/products');
const category = require('./models/category');
const { ServerHeartbeatSucceededEvent } = require('mongodb');

const app = express();

app.use(express.json());
app.use(
	cors(
	{
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	})
)

// ------------------------------------------------------------------------------------------------------------------

// Connect to MongoDB

mongoose
.connect(process.env.DATABASE_URL)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to Connect to MongoDB:', err));

// ------------------------------------------------------------------------------------------------------------------

// Start the 

const port = process.env.PORT || 5000;

app.listen(port, () => 
{
	console.log(`Server running on port ${port}`);
})

// ------------------------------------------------------------------------------------------------------------------

// Route to Fetch All Products

app.get('/product', async (req, res) => 
{
	try 
	{
		const allProducts = await products.find(); 
		res.json(allProducts);
	} 
	catch (err) {
		console.error('Error Fetching Products:', err.message);
		res.status(500).json({ message: 'Error Fetching Products' });
	}
})

// ------------------------------------------------------------------------------------------------------------------

// Route to Fetch Sub Categories based on a Product

app.post('/subcategory', async (req, res) => 
{
	try 
	{
		const { product_name } = req.body;
		const product = await products.findOne({ product_name });

		const productId = product.product_id;

		const categories = await category.find({ product_id: productId }, 'category' )



		const subCategories = [...new Set(categories.map((category) => category.category))]
		// console.log(subCategories)

		// const type = await category.find({sub_categories: subCategories})
		// console.log(type)
		// console.log(categories)

		res.status(200).json({ sub_categories: subCategories });
	} 
	catch (error) {
		console.error('Error in Subcategory Route:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
})

//----------------------------------------------------------------------------------------------

// Route to Fetch Type based on a sub category

app.post('/type', async (req, res) => 
	{
		try 
		{
			const { sub_category } = req.body;
			
	
			const type = await category.find({ category: sub_category }, 'type' )

			// console.log(type);
	
			res.status(200).json({ type: type });
		} 
		catch (error) {
			console.error('Error in Subcategory Route:', error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	})
	


