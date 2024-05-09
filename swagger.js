const { initializeApp, getApps} = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');


process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
initializeApp({projectId: 'mustardtree-6b33e'});
const db = getFirestore();

const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
// const corsOptions = {
//     origin: '*', // replace '*' with your client's origin or an array of allowed origins
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//   };
  
// app.use(cors(corsOptions));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, function () {
  console.log('Listening on port 3000');
});

