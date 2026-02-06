const express = require("express")
const router = express.Router();
const Student = require('../models/student.model');
const protectedRouter = require('../middlewares/auth.middleware')
const studValidation = require('../middlewares/studentValidation')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')

//Protecte All the routes
router.use(protectedRouter)

router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            // return res.status(400).json({ message: "Name is required" });
            throw new ApiError(400, "Name is required")

        }

        const students = await Student.find({
            name: { $regex: name, $options: 'i' } // case-insensitive searching
        });

        res.status(200).json(students);

    } catch (error) {
        throw new ApiError(500, "Something Went Wrong")
    }
});



//Get all Document
router.get('/', async (req, res) => {
    try {

        const response = await Student.find()

        res.status(200).json({ Data: response, message: 'Succesfull' });
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error getting files")
    }
})

//Get Document by id
router.get('/:id', async (req, res) => {
    try {

        const id = req.params.id;

        const response = await Student.findById(id)
        console.log(response);

        res.status(200).json({ Data: response, message: 'Succesfull' });
    } catch (error) {
        throw new ApiError(500, "Error getting files")
    }
})

//Creating new Document
router.post('/post', studValidation, async (req, res, next) => {
    try {

        const data = req.body;
        const { email } = req.body;
        const existEmail = await Student.findOne({ email })

        if (existEmail != null) {
            console.log(existEmail);
            throw new ApiError(400, "Email already exists")

        }

        const response = await Student.create(req.body)

        res.status(200).json({ message: 'File uploaded successfully' });

    } catch (error) {
        next(error);
    }
})

//Updating Document
router.put('/put/:id', async (req, res) => {
    try {

        console.log(req.params.id, req.body);
        const id = req.params.id;
        const data = req.body;

        const response = await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true })

        res.status(200).json({ Data: response, message: 'File Updated Sccesfull' });

    } catch (error) {
        throw new ApiError(500, "Error updating student")
    }
})


//Delete By Id
router.delete('/delete/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const response = await Student.findByIdAndDelete(id)

        res.status(200).json({ message: 'File Deleted successfully' });

    } catch (error) {
        throw new ApiError(500, "Error deleting files")
    }
})




module.exports = router;