const Hotel = require("../models/Hotel");


exports.getHotels = async (req,res,next) => {
    let query;
    //Copy req.query
    const reqQuery={...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit'];

    //Loop pver remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);

    query = Hotel.find(JSON.parse(queryStr)).populate('bookings');
   
    //Select fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

     //Sort
     if(req.query.sort){
        const sortBy = req.query.sort.split(',').join('');
        query = query.sort(sortBy);
     } else {
        query = query.sort("name");
     }

     //Pagination
     const page = parseInt(req.query.page,10)||1;
     const limit = parseInt(req.query.limit,10)||20;
     const startIndex = (page-1)*limit;
     const endIndex = page*limit;

    try{
        const total = await Hotel.countDocuments();
        query = query.skip(startIndex).limit(limit);

        //Execute query
        const hotels=await query;

        //Pagination result
        const pagination = {};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true,count:hotels.length,data:hotels});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};

exports.getHotel = async (req,res,next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if(!hotel){
            return res.status(400).json({success :false});
        }
        res.status(200).json({success : true , data : hotel});
    } catch (err){
        res.status(400).json({success :false});
    }
};

exports.createHotel = async (req,res,next) => {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({
        success : true,
        data : hotel
    });
};

exports.updateHotel = async (req,res,next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id , req.body ,{
            new : true ,   
            runValidators : true //ข้อมูลที่อัพเดตถูกต้องตามโมเดลมั้ย
        });
        if(!hotel){
            return res.status(400).json({success :false});
        }
        res.status(200).json({success : true , data : hotel});
    } catch (err) {
        res.status(400).json({success :false});
    }
    
}

exports.deleteHotel = async (req,res,next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if(!hotel){
            return res.status(404).json({success :false, message:`Hotel not found with id of ${req.params.id}`});
        }
        hotel.deleteOne();
        res.status(200).json({success : true , data : {}});
    } catch (err) { 
        res.status(400).json({success :false});
    }
    
}