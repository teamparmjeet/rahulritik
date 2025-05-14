import mongoose from "mongoose";

const connection = {};

const dbConnect = async () => {
    if (connection.isConnected) {
        console.log("Database Connection avaliable");
        return;
    }

    try {
        const response = await mongoose.connect(process.env.DB_STRING);
        connection.isConnected = response.connections[0].readyState;
        console.log(" Connection to database!");
    } catch (error) { 
        console.log("Error on database connection",error);
        process.exit();
    }
}
export default dbConnect;