const express = require('express');
const router = express.Router();
const {getHotels,getHotel,updateHotel,createHotel,deleteHotel} = require('../controllers/hotels'); 
const bookingRouter = require('./bookings');

const {protect,authorize} = require('../middleware/auth');

router.use('/:hotelId/bookings/',bookingRouter);

router.route('/').get(getHotels).post(protect,authorize('admin'),createHotel);
router.route('/:id').get(getHotel).put(protect,authorize('admin'),updateHotel).delete(protect,authorize('admin'),deleteHotel);

module.exports = router;