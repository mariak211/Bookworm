
import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectedRoute from "../middleWare/auth.middleware.js";

const router  = express.Router();

router.post("/", protectedRoute, async (req, res) => {

    try {
        const {title, caption, rating, image} = req.body;

        if (!title || !caption || !rating || !image) {
            return res.status(400).json({
                message:"Please provide all fields"
            });
        }
        // upload image to cloudinary

        const uploadRes = await cloudinary.uploader.upload(image);
        const imageUrl = uploadRes.secure_url;
        const newBook = new Book ({
            title, 
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        // save the book to database
        await newBook.save()
        res.status(201).json(newBook);

    } catch (error) {
        console.log("Error creating book" , error)
        return res.status(500).json({
            message:error.message
        });
        
    }
})

router.get("/", protectedRoute, async (req, res) => {
    // pagination: Infinite scrolling
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const totalBooks = await Book.countDocuments();
        const books = await Book.find()
        .sorted({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        res.send({
            books,
            currentPage : page,
            totalBooks,
            totalPages:Math.ceil(totalBooks/limit)
        }
        );
        
    } catch (error) {
        console.log("Error in get all the books" , error)
        return res.status(500).json({
            message:"Internal server error"
        });
        
    }
})
router.delete("/:id", protectedRoute, async (req, res)=> {

    try {
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).json({message:"Book not found"});
        if (book.user.toString() !== req.user._id.toString) {
            return res.status(401).json({message:"Unauthoized"});
        }


        // delete image from cloudinary

        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId)
                
            } catch (dleteError) {
                console.log("Errorr deleting image from Cloudinary")
            }

        }
        await book.deleteOne();
        res.json({message: "Book Deleted successfully"})
    } catch (error) {
        console.log("Error deleting book" , error)
        return res.status(500).json({
            message:"Internal server error"
        });
    }
})

router.get("/user", protectedRoute, async (req, res) =>{
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json(books)
    } catch (error) {
        console.log("Get user books errors", error.message);
        res.status(500).json({message: "Internal server error"});
    }
})


export default router