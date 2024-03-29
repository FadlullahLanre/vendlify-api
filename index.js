const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
//const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const userRoute = require('./routes/user');
const vendorRoute = require('./routes/vendor');
const orderRoute = require('./routes/order');
const productRoute = require('./routes/product');
const schoolRoute = require('./routes/school');
const mFeeRoute = require('./routes/miscellaneousFee');
const dFeeRoute = require('./routes/deliveryFee');
const brandServiceRoute = require('./routes/brandService');
const connectDB = require('./DB/connect');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/globalErrors');
const catchAsync = require('./utils/catchAsync');

const app = express();
// any origin can access the resource
app.use(cors({
    origin: '*'
}));
// for parsing application/json
app.use(express.json());

//1 Global middlewares
// Set security HTTP headers
//app.use(helmet());

//Limit requests from same ip
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this ip, please try again in an hour',
});
app.use('/api', limiter);

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss(html code attack)
app.use(xss());

app.use('/api/v1/vendors', vendorRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/school', schoolRoute);
app.use('/api/v1/miscellaneous', mFeeRoute);
app.use('/api/v1/delivery', dFeeRoute);
app.use('/api/v1/services', brandServiceRoute);

app.get('/', function (req, res) {
	res.send({ message : 'Welcome to the Vendlify api!'});
  
  });

app.all('*', (req, res, next) => {
	//   const err = new Error(`Can't find ${req.originalUrl} on this server`)
	//   err.status = "fail"
	//   err.statusCode = 404
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

const port = process.env.PORT || 4000;
const start = catchAsync(async () => {
	await connectDB(process.env.MONGO_URI);

	app.listen(port, () => {
		console.log(`Server is listening on port ${port}...`);
	});
});

app.use(globalErrorHandler);
start();
