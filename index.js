const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const port = process.env.PORT || 5000;


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
        const allUsersCollection = client.db('recyclebindb').collection('allUsers');

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

        app.get('/purchasedproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const products = await purchasedProductsCollection.find(query).toArray()
            res.send(products)
        })

        app.post('/purchasedproducts', async (req, res) => {
            const purchasedproducts = req.body;
            const result = await purchasedProductsCollection.insertOne(purchasedproducts);
            res.send(result);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await allUsersCollection.find(query).toArray()
            if (user) {
                const token = jwt.sign({ email }, process.env.SECRET_TOKEN, { expiresIn: '5d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ message: 'unauthorized' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await allUsersCollection.insertOne(user)
            res.send(result)
        })



    }
    finally {

    }
}

run().catch(error => console.error(error))



app.listen(port, () => {
    console.log('server is running on', port);
});