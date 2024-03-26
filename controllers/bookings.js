const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

exports.getBookings = async (req, res, next) => {
    let query;

    // Ensure that req.user is defined before checking its role
    if (req.user && req.user.role == 'user') {
        query = Booking.find({ user: req.user.id }).populate({
            path:'hotel',
            select: 'name address tel'
        });
    } else {
        // If not a user (possibly an admin), check for hotelId
        if (req.params.hotelId) {
            console.log(req.params.hotelId);
            query = Booking.find({ hotel: req.params.hotelId }).populate({
                path:'hotel',
                select: 'name address tel'
            });
        } else {
            // If no hotelId is specified, retrieve all bookings
            query = Booking.find().populate({
                path:'hotel',
                select: 'name address tel'
            });
        }
    }

    try {
        const bookings = await query;
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Booking"
        });
    }
};

exports.getBooking = async(req,res,next) =>{
    try{
        const booking = await Booking.findById(req.params.id).populate({
            path: 'hotel',
            select : 'name address tel'
        });
        
        if(!booking){
            return res.status(404).json({success:false,
                msg: `No booking with id of ${req.params.id}`
            })
        }

        res.status(200).json({success:true , data:booking});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false , msg: "Cannot find booking"})
    }
}


exports.addBooking = async(req,res,next) =>{
    try{
        req.body.hotel = req.params.hotelId; 
        

        //ใช้ตอนสร้าง appointment โดยเพิ่ม hospital = hospitalId

        //add userId to req.body
        req.body.user=req.user.id;

        const hotel = await Hotel.findById(req.params.hotelId);
        
        if(!hotel){
            return res.status(404).json({
                success:false,
                msg:`No hotel with the id of ${req.params.hotelId}`
            })
        }

        
        const { user, startDate, endDate } = req.body;
        // Calculate the duration of the new booking
        const nowDate = new Date();
        const StartDate = new Date(req.body.startDate);

        if( nowDate > StartDate ){
            return res.status(400).json({
                success:false,
                msg:'Please check startDate'
            });
        }


        if(startDate>endDate){ 
            return res.status(400).json({
                success:false,
                msg:`Please check startDate or endDate booking `
            });

        }
        const newBookingDuration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)); // in days
        if(newBookingDuration >= 3 && req.user.role !== 'admin' ){ 
            return res.status(400).json({
                success:false,
                msg:`The user with ID ${req.user.id} has booking more then 3 days`
            });
        }
        
        
        const booking = await Booking.create(req.body);
        res.status(200).json({
            success:true , data:booking 
        })
    } catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false , msg: "Cannot create booking"})
    }
}

exports.updateBooking = async(req,res,next) =>{
    try {
        let booking = await Booking.findById(req.params.id); //หาก่อนว่าเจอไหม

        if(!booking){
            return res.status(404).json({
                success:false,
                msg:`No booking with the id of ${req.params.id}`
            })
        }

        //Ownership
        //Make sure user is the appt owner
        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success:false,
                msg:`User ${req.user.id} is not authorized to update this booking`  
            })          
        }

        booking = await Booking.findByIdAndUpdate(req.params.id,req.body,{
            new:true ,
            runValidators : true 
        }) ;
        res.status(200).json({
            success:true , data:booking
        })        
    } catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false , msg: "Cannot update Booking"})
    }
}

exports.deleteBooking = async(req,res,next) =>{
    try {
        let booking = await Booking.findById(req.params.id); //หาก่อนว่าเจอไหม

        if(!booking){
            return res.status(404).json({
                success:false,
                msg:`No booking with the id of ${req.params.id}`
            })
        }
        // Ownership
        // Make sure user is the booking owner

        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success:false,
                msg:`User ${req.user.id} is not authorized to delete this booking`  
            })          
        }

        await booking.deleteOne();
        res.status(200).json({
            success:true , data:{}
        })        
    } catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false , msg: "Cannot delete booking"})
    }
}


