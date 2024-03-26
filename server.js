const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize=require('express-mongo-sanitize');
const cors = require('cors')
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config({path :'./config/config.env'});

connectDB();

const app = express();
app.use(express.json());
app.use(cors()); 

const hotels = require('./routes/hotels');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');

app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter=rateLimit({
    windowsMs:10*60*1000,//10 mins
    max: 500
    });
app.use(limiter);
app.use(hpp());



app.use('/api/v1/hotels',hotels);
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings',bookings);
app.use(cookieParser());



const PORT = process.env.PORT || 5000 ;
const server = app.listen(
    PORT,
    console.log(
        'Server running in' , 
        process.env.NODE_ENV,
        'on ' + process.env.HOST+ ':' + PORT 
         )
    );
    const swaggerOptions={
        swaggerDefinition:{
            openapi: '3.0.0',
            info: {
                title: 'Library API',
                version: '1.0.0',
                description: 'A simple Express VacQ API'
            },
            servers :[
                {
                    url : process.env.HOST + ':' + PORT + '/api/v1'
                }
            ]
        },
        apis:['./routes/*.js'],
    };
    const swaggerDocs=swaggerJsDoc(swaggerOptions);
    app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

process.on('unhandledRejection',(err,promise) => {
    console.log(`Error : ${err.message}`);
    server.close(()=> process.exit(1));
})

