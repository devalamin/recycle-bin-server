const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const e = require('express');
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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: unauthorized })

    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden' })
        }
        req.decoded = decoded;
        next()
    })
}

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized' })
//     }
//     const token = authHeader.split(' ')[1]
//     jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
//         if (err) {
//             res.status(401).send({ message: 'unauthorized access' })
//         }
//         req.decoded = decoded;
//         next();
//     })

// }



async function run() {
    try {
        const categoriesCollection = client.db('recyclebindb').collection('categories');
        const productsCollection = client.db('recyclebindb').collection('products');
        const purchasedProductsCollection = client.db('recyclebindb').collection('purchased_products');
        const allUsersCollection = client.db('recyclebindb').collection('allUsers');
        const reportedProductsCollection = client.db('recyclebindb').collection('reported');

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

        app.get('/advertisment', async (req, res) => {
            const adstatus = 'forAdvertise'
            const query = { adstatus: adstatus };
            const result = await productsCollection.find(query).limit(3).toArray()
            res.send(result)
        });

        app.get('/dashboard/myproducts', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            const result = await productsCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/dashboard/addingproducts', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        });

        app.put('/dashboard/advertise/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    adstatus: 'forAdvertise'
                }
            }
            const result = await productsCollection.updateOne(query, updatedDoc, options)
            res.send(result);
        });

        app.delete('/dashboard/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        });


        app.get('/purchasedproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const products = await purchasedProductsCollection.find(query).toArray()
            res.send(products)
        });

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
                const token = jwt.sign({ email }, process.env.SECRET_TOKEN, { expiresIn: '30d' })
                return res.send({ accessToken: token })
            };
            res.status(403).send({ message: 'unauthorized' })
        });


        app.get('/users', async (req, res) => {
            const filter = {}
            const users = await allUsersCollection.find(filter).toArray();
            res.send(users);
        });

        app.get('/singleuser', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await allUsersCollection.findOne(query);
            res.send(result)
        });

        app.get('/selleraccount', async (req, res) => {
            const query = { account_type: 'seller' }
            const result = await allUsersCollection.find(query).toArray()
            res.send(result)
        });

        app.delete('/sellerdelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await allUsersCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await allUsersCollection.insertOne(user)
            res.send(result)
        });

        app.get('/reported', async (req, res) => {
            const query = {}
            const result = await reportedProductsCollection.find(query).toArray()
            res.send(result)
        });

        app.post('/reported', async (req, res) => {
            const product = req.body;
            const result = await reportedProductsCollection.insertOne(product)
            res.send(result)
        });

        app.delete('/reported/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await reportedProductsCollection.deleteOne(query)
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