import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URI);
        console.log(`mongodb connected ${conn.connection.host}`);
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

export default dbConnect;