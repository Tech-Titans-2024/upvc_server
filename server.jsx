require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const product = require('./models/products');
const category = require('./models/category');
const pricelist = require('./models/pricelist');
const Category = require('./models/category');
const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

//-------------------------------------------------------------------------------------------------------

// Fetch Types of Doors and Windows

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

    try {
        let varientTypes = [];
        if (selected_category === 'Door') {
            varientTypes = await category.find({ type: selected_type }, 'varient category_id');
        }
        else if (selected_category === 'Window') {
            varientTypes = await category.find({ type: selected_type },);
        }
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
        const productId = await product.findOne({ product_name: 'Louver' });
        const productTypes = await category.find({ product_id: productId.product_id });
        res.json(productTypes);
    }
    catch (error) {
        console.error("Error fetching Louver Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

// ------------------------------------------------------------------------------------------------------------------

// Serve static files (images)
app.use('/product_images', express.static(path.join(__dirname, 'product_images')));


// Set up MongoDB connection
const dbURI = process.env.DATABASE_URL;
if (!dbURI) {
    console.error('MongoDB URI is not defined in .env file!');
    process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));


// Multer setup for storing the file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './product_images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage });

// Check if Type ID exists
app.get('/check-typeid/:typeId', async (req, res) => {
    const { typeId } = req.params;
    try {
        const category = await Category.findOne({ type_id: typeId });
        if (category) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking Type ID:', error);
        res.status(500).json({ message: 'Failed to check Type ID.', error: error.message });
    }
});

// Upload Image
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { type_id } = req.body;
        if (!type_id) {
            return res.status(400).json({ message: 'Type ID is required.' });
        }

        // Check if the type_id exists in the database
        const category = await Category.findOne({ type_id });
        if (!category) {
            return res.status(400).json({ message: 'Invalid Type ID.' });
        }

        const imagePath = `/product_images/${req.file.filename}`;

        // Update category document with the image path
        category.image = imagePath;
        await category.save();

        res.status(200).json({ message: 'Image uploaded and saved successfully!', imagePath });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file.', error: error.message });
    }
});


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});






//---------------------------------------------------------------------------------------------------

app.post('/pricelist', async (req, res) => {

    const { height, width, selectedProduct, selectedType, selectedVarient, brand } = req.body;
    console.log(selectedProduct, selectedType, selectedVarient, " data w,h")
    console.log(height, width, "h and wifht")
    try {
        const productId = await product.findOne({ product_name: selectedProduct })
        const gategory_data = await category.findOne({
            product_id: productId.product_id,
            $or: [
                { type: selectedType },    
                { type: { $exists: false } } 
            ],
            varient: selectedVarient        
        });
        console.log("Cate:", gategory_data)
        if (gategory_data) {
            console.log("data type", gategory_data.type_id, width, height, brand);
            const type = gategory_data.type_id;
            const getPrice = await pricelist.findOne({
                product: type,
                width: width,
                height: height,
                variety: brand

            })
            const img = gategory_data.image;
            if (getPrice) {
                
                console.log("price", getPrice.price, img)
                res.json({ "data": getPrice.price, img })
            }
            else {
                console.log("no data")
                res.json({ "data": 10, img })
            }
        }

        console.log(gategory_data.type_id)
    }
    catch (error) {

    }
})

app.post('/quotation-save', async (req, res) =>{
    const { data } = req.body;
    console.log("Data",data)
    try{
        res.status(200).json
    }catch(error){
        res.status(500).json
    }
})