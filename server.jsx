const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
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


app.get('/pricelistdata', async (req, res) => {
    try {
        const priceData = await pricelist.find();
        const result = await Promise.all(
            priceData.map(async (item) => {
                const category = await Category.findOne({ type_id: item.product });
                if (!category) {
                    throw new Error(`Category not found for type_id: ${item.product}`);
                }
                return {

                    width: item.width,
                    variety: item.variety,
                    type: category.type || "NA",
                    variant: category.varient || "NA",
                    price: item.price,
                    height: item.height,
                    pro_price_id: item.pro_price_id
                };
            })
        );
        res.json(result);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});




app.post('/editprice', async (req, res) => {
    const { editData } = req.body;
    // console.log(editData,"DATA")
    console.log(editData.pro_price_id, "ID")
    const id = Number(editData.pro_price_id)
    // console.log("STRING ",typeof id)

    const existData = await pricelist.find({
        pro_price_id: id
    })
    if (existData) {
        try {
            const updatePrice = await pricelist.updateOne({
                pro_price_id: id
            },
                { $set: { price: editData.price } })
            {
                price: editData.price
            }
            res.json({ "Message": "Price Updated" })
        } catch (err) {
            res.json({ "Message": "Data NOt updated" })
        }
    }
    else {
        res.json({ "Message": "Price Data Not exist" })
    }
});

//-----------------------------------

app.post('/deleteprice', async (req, res) => {
    const { deleteData } = req.body;
    try {
        const deleteprice = await pricelist.deleteOne({
            pro_price_id: deleteData.pro_price_id
        })
        res.json({ "Message": "Price Date Deleted" })
    } catch (err) {
        res.json({ "Message": "Data Not Deleted" })
    }
})

// ------------------------------------------------------------------------------------------------------------------


//-----------------------------------
app.get('/salespersons', async (req, res) => {
    try {
        const salesPerData = await User.find({

        })
        if (salesPerData) {
            res.json(salesPerData)
        }
        else {
            res.json({ "Message": "Not FOunt" })
        }
    } catch (err) {
        res.json({ "Message": "Not FOunt" })

    }
})
//--------------------------------------------
app.get('/customers', async (req, res) => {
    try {
        const customerData = await Order.find({

        })
        if (customerData) {
            res.json(customerData)
        }
        else {
            res.json({ "Message": "Not FOunt" })

        }
    } catch (err) {
        res.json({ "Message": "Not FOunt" })

    }
})


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
                totalPrice: item.totalPrice,
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
})

//-----------------------------------------------------------------------------------------------------

app.get('/salesmans', async (req, res) => {
    try {
        const salesmanData = await User.find({ username: { $ne: 'ADMIN' } })
            .select('username');
        res.json(salesmanData);
    }
    catch (error) {
        console.error('Error fetching salesmen:', error);
        res.status(500).json({ message: 'Error fetching salesmen data' });
    }
})

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
})

//-----------------------------------------------------------------------------------------------------

app.get('/quotation', async (req, res) => {
    try {
        const quotations = await Quotation.find();
        res.json(quotations);
    }
    catch (error) {
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
})

//-----------------------------------------------------------------------------------------------------

// Update Quotation Products API

app.put('/quotation/:id', async (req, res) => {

    const { id } = req.params;
    const { product } = req.body;

    try {
        const existingQuotation = await Quotation.findById(id);
        if (!existingQuotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        existingQuotation.product = product;

        const updatedQuotation = await existingQuotation.save();

        return res.status(200).json({
            message: 'Quotation updated successfully',
            data: updatedQuotation,
        });
    }
    catch (error) {
        console.error('Error updating the Quotation :', error);
        return res.status(500).json({
            message: 'An error occurred while updating the Quotation', error: error.message,
        })
    }
})

//-----------------------------------------------------------------------------------------------------

// Delete Quotation API

app.delete('/quotation/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const quotation = await Quotation.findByIdAndDelete(id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        return res.json({ message: 'Quotation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting Quotation:', error);
        return res.status(500).json({
            message: 'An error occurred while deleting the Quotation', error: error.message,
        })
    }
})

//-----------------------------------------------------------------------------------------------------


// Add a new salesperson
app.post("/salespersons", async (req, res) => {
    const { username, password, number, name, address } = req.body;

    // Validation
    if (!username || !password || !number || !name || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Create new salesperson
        const newUser = new User({
            username,
            password,
            number,
            name,
            address,
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add salesperson" });
    }
});
//-----------------------------------------------------------------------------------------------------

// Delete the sales Person

app.delete('/salespersons/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await User.findByIdAndDelete(id); // Assuming you're using Mongoose
        if (!result) {
            return res.status(404).json({ error: "Salesperson not found." });
        }
        res.status(200).json({ message: "Salesperson deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete salesperson." });
    }
});


//-----------------------------------------------------------------------------------------------------

// Edit the sales Person


app.put('/salespersons/:id', async (req, res) => {
    const { username, name, number, address } = req.body;

    // Validate fields
    if (!username || !name || !number || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Ensure that you're using the correct model (e.g., SalesPerson)
        const updatedPerson = await User.findByIdAndUpdate(
            req.params.id, 
            { username, name, number, address }, 
            { new: true, runValidators: true } 
        );

        if (!updatedPerson) {
            return res.status(404).json({ error: "Salesperson not found" });
        }

        // Return the updated document
        res.status(200).json(updatedPerson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update salesperson" });
    }
});
