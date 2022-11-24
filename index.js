const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;

require('dotenv').config()

const app = express();

// middlewares
app.use(cors());
app.use(express.json());





app.get('/', (req, res) => {
    res.send('hello world')
});



const uri = `mongodb+srv://${process.env.DB_USER_RECYCLE}:${process.env.DB_PASSWORD_RECYCLE}@cluster0.3b5klku.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('recyclebindb').collection('categories');
        const productsCollection = client.db('recyclebindb').collection('products');
        const purchasedProductsCollection = client.db('recyclebindb').collection('purchased_products');

        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoriesCollection.find(query).toArray()
            res.send(categories)
        });


        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        app.post('/purchasedproducts', async (req, res) => {
            const purchasedproducts = req.body;
            const result = await purchasedProductsCollection.insertOne(purchasedproducts);
            res.send(result)
        });



    }
    finally {

    }
}

run().catch(error => console.error(error))



app.get('/categories/:products', async (req, res) => {

})

app.listen(port, () => {
    console.log('server is running on', port);
});