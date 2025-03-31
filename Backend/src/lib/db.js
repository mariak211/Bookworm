import mongoose  from "mongoose";

export const connectDB = async () =>{

    try {
        const dbConnect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected ${dbConnect.connection.host}`);
    
    } catch(error) {
        console.log("Error connecting to database", error)
        process.exit(1)
    }
}

