import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";



const router = express.Router()


const genenerateToken = (userId) => {
    return jwt.sign({userId},process.env.JWT_SECRET, {expiresIn: "1d"});
}


router.post("/register", async (req, res) => {
    // create a new user here
    try {
        const {email, username, password} = req.body
        if (!username || !email|| !password) {
            return res.status(400).json({
                message:"All fields are required"
            });
        }

        if (password.length < 6 ) {
            return res.status(400).json({
                message:"Password should be at least 6 characters long"
            });

        }


        if (username.length < 3 ) {
            return res.status(400).json({
                message:"Username should be at least 3 characters long"
            });

        }

        const emailExist = await User.findOne({email});

        if (emailExist) {
            return res.status(400).json({
                message:"Email already exists"
            });
        }

        const usenameExist = await User.findOne({username});
        if (usenameExist) {
            return res.status(400).json({
                message:"Username already exists"
            });
        }

       const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        const user = new User( {
            email,
            username ,
            password,
            profileImage,
        })

        await user.save();

        // generate token and send it to client

        const token = genenerateToken(user._id);
        res.status(201).json({
            token,
            user: {
                user_id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage

            },

        });

    } catch(error) {
        console.log("Error register User" , error)
        return res.status(500).json({
            message:"Internal Server error"
        });
    }
   
});

router.post("/login", async (req, res) => {
    try {

        const {email, password} = req.body;
        if (!email || !password) return res.status(400).json({message: "All fields are required"});


        const user = await User.findOne({email});

        if (!user) return res.status(400).json({message: "Invalid credentials"});

        
        const isMatchingPassword = await user.compparePassword(password);

        if (!isMatchingPassword) return res.status(400).json({message: "Invalid credentials"})


        const token = genenerateToken(user._id);

        res.status(201).json({
            token,
            user: {
                user_id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage

            },

        });
    } catch (error) {

        console.log("Error login User" , error)
        return res.status(500).json({
            message:"Internal Server error"
        });
    }
});


export default router