const mongoose = require ('mongoose');

const HotelSchema = new mongoose.Schema({
    name : {
        type : String,
        unique : true,
        trim : true,
        require : [true , 'Please add a name']
    },
    address : {
        type : String,
        unique : true,
        required : [true , 'Please add an address'],
    },
    tel : {
        type : String,
        unique : true,
        require : [true , "Please add a Hotel's telephone Number"]
    }
}, {
    toJSON : {virtuals:true},
    toObject : {virtuals:true}
});

HotelSchema.pre('deleteOne',{ document: true, query: false}, async function(next){
    console.log(`Bookings being remove from hotel ${this._id}`);
    await this.model('Booking').deleteMany({hotel: this._id});
    next();
});

HotelSchema.virtual('bookings',{
     ref: 'Booking',
     localField : '_id',
     foreignField : 'hotel',
     justOne : false
});

module.exports = mongoose.model('Hotel',HotelSchema)