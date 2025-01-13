require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const User = require('./models/login');
const Product = require('./models/products');
const pricelist = require('./models/pricelist');
const Category = require('./models/category');
const Quotation = require('./models/quotation');
const Order = require('./models/order');

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const dbURI = process.env.DATABASE_URL;
if (!dbURI) {
    console.error('MongoDB URI is not defined in .env file!');
    process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/product_images', express.static(path.join(__dirname, 'product_images')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './product_images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    },
})

const upload = multer({ storage });

//-------------------------------------------------------------------------------------------------------

// Login

app.post('/login', async (req, res) => {

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid username or password." });
        }

        if (user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid username or password." });
        }

        res.json({ success: true, message: "Login successfull" });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
})


//-------------------------------------------------------------------------------------------------------

// Fetch Types of Doors and Windows

app.get('/doorTypes', async (req, res) => {

    try {
        const productId = await Product.findOne({ product_name: 'Door' });
        const productTypes = await Category.find({ product_id: productId.product_id }, 'type');
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
        const productId = await Product.findOne({ product_name: 'Window' });
        const productTypes = await Category.find({ product_id: productId.product_id }, 'type');
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
            varientTypes = await Category.find({ type: selected_type }, 'varient category_id');
        }
        else if (selected_category === 'Window') {
            varientTypes = await Category.find({ type: selected_type },);
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
        const productId = await Product.findOne({ product_name: 'Louver' });
        const productTypes = await Category.find({ product_id: productId.product_id });
        res.json(productTypes);
    }
    catch (error) {
        console.error("Error fetching Louver Types : ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

})

// ------------------------------------------------------------------------------------------------------------------

// Price List for Products
app.post('/pricelist', async (req, res) => {

    const { height, width, selectedProduct, selectedType, selectedVarient, brand } = req.body;

    try {

        const productId = await Product.findOne({ product_name: selectedProduct })

        const category_data = await Category.findOne({
            product_id: productId.product_id,
            $or: [
                { type: selectedType },
                { type: { $exists: false } }
            ],
            varient: selectedVarient
        })

        const img = category_data.image;

        if (category_data) {
            const type = category_data.type_id;
            const getPrice = await pricelist.findOne({
                product: type,
                width: width,
                height: height,
                variety: brand
            })
            if (getPrice) {
                res.json({ "data": getPrice.price, img })
            }
            else {
                res.json({ "data": 300, img })
            }
        }
    }
    catch (error) {
        console.error('Error fetching Price List:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ------------------------------------------------------------------------------------------------------------------

// Quotation Save

app.post('/quotation-save', async (req, res) => {

    const { data } = req.body;

    try {
        const { customer, savedData } = data;

        if (!customer || !savedData) {
            return res.status(400).json({ message: "Missing required data (customer or savedData)." });
        }

        const newQuotation = new Quotation({
            quotation_no: customer.quotation,
            salesper: customer.salesper,
            cus_name: customer.cus_name,
            cus_add: customer.cus_add,
            cus_con: customer.cus_con,
            date: customer.date,
            netTotal: customer.netTotal,
            gst: customer.gst,
            gTotal: customer.gTotal,
            product: savedData.map(item => ({
                brand: item.brand,
                product: item.product,
                type: item.type,
                varient: item.varient,
                mesh: item.mesh,
                width: item.width,
                height: item.height,
                area: item.area,
                price: item.price,
                glass: item.glass,
                roller: item.roller,
                totalPrice: item.totalPrice,
                handleType: item.handleType,
                color: item.color,
                additionalcost: item.additionalcost,
                quantity: item.quantity,
                total: item.total
            }))
        })
        await newQuotation.save();
        res.status(200).json({
            message: "Quotation Saved Successfully",
            quotation: newQuotation
        })
    }
    catch (error) { }
})

// ------------------------------------------------------------------------------------------------------------------

app.get('/check-typeid/:typeId', async (req, res) => {

    const { typeId } = req.params;

    try {
        const category = await Category.findOne({ type_id: typeId });
        if (category) {
            return res.json({ exists: true });
        }
        else {
            return res.json({ exists: false });
        }
    }
    catch (error) {
        console.error('Error checking Type ID:', error);
        res.status(500).json({ message: 'Failed to check Type ID.', error: error.message });
    }
})

// ------------------------------------------------------------------------------------------------------------------


app.post('/upload', upload.single('image'), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { type_id } = req.body;
        if (!type_id) {
            return res.status(400).json({ message: 'Type ID is required.' });
        }

        const category = await Category.findOne({ type_id });
        if (!category) {
            return res.status(400).json({ message: 'Invalid Type ID.' });
        }

        const imagePath = `/product_images/${req.file.filename}`;

        category.image = imagePath;
        await category.save();

        res.status(200).json({ message: 'Image uploaded and saved successfully!', imagePath });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file.', error: error.message });
    }
});

//-----------------------------------------------------------------------------------------------------

app.get('/salesmans', async (req, res) => {
    try {
        const salesmanData = await User.find({ username: { $ne: 'ADMIN' } })
            .select('username');
        res.json(salesmanData);
    } catch (error) {
        console.error('Error fetching salesmen:', error);
        res.status(500).json({ message: 'Error fetching salesmen data' });
    }
});

//-----------------------------------------------------------------------------------------------------

app.get('/quotationNo', async (req, res) => {
    try {
        const result = await Quotation.aggregate([
            {
                $group: {
                    _id: null,
                    maxQuotationNo: { $max: "$quotation_no" }
                }
            },
            {
                $project: {
                    _id: 0,
                    maxQuotationNo: 1
                }
            }
        ]);

        if (result.length > 0) {
            res.json(result[0].maxQuotationNo);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error("Error fetching max quotation number:", err);
        res.status(500).send("Internal Server Error");
    }
});


//-----------------------------------------------------------------------------------------------------


app.get('/quotation',async (req,res)=>{
    try{
        const quotations = await Quotation.find();
        res.json(quotations);
    }
    catch(error){
        console.error(error);
    }
})


//-----------------------------------------------------------------------------------------------------


app.post('/orderconfirm', async (req, res) => {
    
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).send('Order Confirmed successfully');
    } catch (error) {
        res.status(500).send('Error confirming order');
    }
});

//-----------------------------------------------------------------------------------------------------


// Update Quotation Products API
app.put('/quotation/:id', async (req, res) => {
    const { id } = req.params; // Extract the quotation ID from the URL
    const { product } = req.body; // Extract the updated product details from the request body    

    try {
        // Validate if the quotation exists
        const existingQuotation = await Quotation.findById(id);
        if (!existingQuotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        // Update the product details
        existingQuotation.product = product;

        // Save the updated quotation to the database
        const updatedQuotation = await existingQuotation.save();

        return res.status(200).json({
            message: 'Quotation updated successfully',
            data: updatedQuotation,
        });
    } catch (error) {
        console.error('Error updating the quotation:', error);
        return res.status(500).json({
            message: 'An error occurred while updating the quotation',
            error: error.message,
        });
    }
});