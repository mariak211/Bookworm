import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async(req, res, next)=> {
    try {

        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token)return res.status(401).json({ message:"No authentication token, access denied"});


        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await User.findById(decoded.userID).select("-password");

        if (!user) return res.status(401).json({ message:"Invalid token"})

        req.user = user;
        next();
        
    } catch (error) {
        console.log("Authentication Error", error.message)

        res.status(401).json({ message:"Invalid token"})
        
    }
}


export default protectedRoute
