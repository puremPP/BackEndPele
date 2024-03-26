const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', true);
    const con = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Mongo Connected : ${con.connection.host}`);
};

module.exports = connectDB;