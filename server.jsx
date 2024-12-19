require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const products = require('./models/products');
// const category = require('./models/category');
const { ServerHeartbeatSucceededEvent } = require('mongodb');
const category = require('./models/category');
const product = require('./models/products');

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

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
})

// ------------------------------------------------------------------------------------------------------------------

// Route to Fetch All Products

app.get('/product', async (req, res) => {
	try {
		const allProducts = await products.find(); // Fetch all products
		// console.log(allProducts);
		if (allProducts.length === 0) {
			return res.status(404).json({ message: 'No products found' });
		}
		res.json(allProducts); // Send the products
	} catch (err) {
		console.error('Error Fetching Products:', err.message);
		res.status(500).json({ message: 'Error Fetching Products' });
	}
});


// ------------------------------------------------------------------------------------------------------------------

// Route to Fetch Sub Categories based on a Product

app.post('/subcategory', async (req, res) => {
	try {
		const { product_name } = req.body;
		const product = await products.findOne({ product_name });

		const productId = product.product_id;

		const categories = await category.find({ product_id: productId }, 'category')



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

app.post('/type', async (req, res) => {
	try {
		const { category_name, product } = req.body;
		// console.log(category_name, "gftd", product)
		const type = await category.find({ category_name: category_name, product_id: product }, 'type')
		// console.log(type);
		res.status(200).json({ type: type });
	}
	catch (error) {
		console.error('Error in Subcategory Route:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
})


//--------------------------------------------------------------------------------
app.get('/productdetails/:pid', async (req, res) => {
	try {
		const { pid } = req.params; 
		// console.log("productName", pid)
		const productDetails = await products.findOne({ product_id: pid });
		// console.log("productDetails", productDetails)
		if (productDetails) {
			res.json(productDetails); 
		} else {
			res.status(404).json({ message: 'Product not found' });
		}
	} catch (err) {
		console.error("Error fetching product details:", err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
});


//--------------------------------------------------------------------------------
app.post('/product', async (req, res) => {
	try {
		const { product_id } = req.body;
		// console.log("Product ID:", product_id);
		const categories = await category.find({ product_id });
		if (categories.length === 0) {
			return res.status(404).json({ message: "No categories found for the given product_id" });
		}
		res.json({ categories });
	} catch (err) {
		console.log("Error:", err);
		res.status(500).json({ message: "Internal Server Error" });
	}
});
//--------------------------------------------------------------------------------
//Price

app.get('/price', async(req, res)=>{
	try
	{
		const products = await category.find();
		res.json(products)

	}
	catch(error)
	{
		console.log(error)

	}
})



//----------------------------------------------------------------------------------------------

// Fetch Products

app.get('/productDetails', async (req, res) => {
	
	try {
		const products = await product.find();
		res.json(products);
	}
	catch(error) {
		console.error("Error fetching Products : ", error);
		res.status(500).json({ message: 'Internal Server Error' });
	}

})

//----------------------------------------------------------------------------------------------

// Fetch Types
// Fetch Types for Door, Window, and Louver
app.get('/doorTypes', async (req, res) => {
    try {
        const productId = await products.findOne({ product_name: 'Door' });
        const productTypes = await category.find({ product_id: productId.product_id }, 'category');
        const uniqueProductTypes = [...new Set(productTypes.map((category) => category.category))];
        res.json(uniqueProductTypes);
    } catch (error) {
        console.error("Error fetching Door Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/windowTypes', async (req, res) => {
    try {
        const productId = await products.findOne({ product_name: 'Window' });
        const productTypes = await category.find({ product_id: productId.product_id }, 'category');
        const uniqueProductTypes = [...new Set(productTypes.map((category) => category.category))];
        res.json(uniqueProductTypes);
    } catch (error) {
        console.error("Error fetching Window Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/louverTypes', async (req, res) => {
    try {
        const productId = await products.findOne({ product_name: 'Louver' });
        const productTypes = await category.find({ product_id: productId.product_id }, 'category');
        const uniqueProductTypes = [...new Set(productTypes.map((category) => category.category))];
        res.json(uniqueProductTypes);
    } catch (error) {
        console.error("Error fetching Louver Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Fetch Varients for Door, Window, and Louver
app.post('/varientTypes', async (req, res) => {
    const { selected_type, selected_category } = req.body;

    try {
        let varientTypes = [];
        if (selected_category === 'Door') {
            varientTypes = await category.find({ category: selected_type }, 'type');
        } else if (selected_category === 'Window') {
            varientTypes = await category.find({ category: selected_type }, 'type');
        } else if (selected_category === 'Louver') {
            varientTypes = await category.find({ category: selected_type }, 'type');
        }

        res.json(varientTypes);
    } catch (error) {
        console.error("Error fetching Variant Types: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
