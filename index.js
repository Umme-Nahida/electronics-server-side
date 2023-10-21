const express = require("express")
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const allBrands = require('./allBrands.json')

const app = express()
const cors = require("cors")
const port = process.env.PORT || 3000


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jeh0ui5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version


async function run() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("insertDB");
    const productCollection = database.collection("productCollection");
    const myStoreCollection = database.collection("myStoreCollection")


    //  show the 6 type of brand
    app.get('/allBrands', async (req, res) => {
      res.send(allBrands)
    })

    app.get('/details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query)
      res.send(result)
    })

    // load the product use by brand
    app.get('/brands/:id', async (req, res) => {
      const brand = req.params.id.toLowerCase()
      console.log(brand)
      const regex = new RegExp(brand, 'i');
      const results = await productCollection.find({ brand: { $regex: regex } }).toArray();
      res.send(results)
    })

    //  read the all product 
    app.get('/products', async (req, res) => {
      const result = await productCollection.find({}).toArray()
      res.send(result)
    })
    //  create product to the database
    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct)
      const { brand } = newProduct;
      const result = await productCollection.insertOne(newProduct)
      res.send(result)
    })

    // update the specific one product 
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      console.log(product)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };

      const updateProduct = {
        $set: {
          name: product.name,
          brand: product.brand,
          type: product.type,
          rating: product.rating,
          price: product.price,
          photo: product.photo
        }
      }
      const result = await productCollection.updateOne(filter, updateProduct, options)
      res.send(result)
    })


    app.delete('/storeProduct/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await myStoreCollection.deleteOne(query)
      res.send(result)
    })

    // get the user product by the email
    app.get('/getMyCart/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      console.log(email)
      const result = await myStoreCollection.find(query).toArray()
      res.send(result)

    })

    // add product on the database 
    app.post('/myStore', async (req, res) => {
      const addproduct = req.body;
      console.log(addproduct)
      const result = await myStoreCollection.insertOne(addproduct)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('my assignment ten server is running')
})

app.listen(port, () => {
  console.log(`my simple assignment ten is running on port ${port}`)
})