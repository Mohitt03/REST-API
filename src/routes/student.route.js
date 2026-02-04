const express = require("express")
const router = express.Router();
const Student = require('../models/student.model');
const protectedRouter = require('../middleware/auth.middleware')


router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const students = await Student.find({
            name: { $regex: name, $options: 'i' } // case-insensitive searching
        });

        res.status(200).json(students);

    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
});



//Get all Document
router.get('/', protectedRouter, async (req, res) => {
    try {

        const response = await Student.find()

        res.status(200).json({ Data: response, message: 'Succesfull' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting files', error: error.message });
    }
})

//Get Document by id
router.get('/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const response = await Student.findById(id)

        res.status(200).json({ Data: response, message: 'Succesfull' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting files', error: error.message });
    }
})

//Creating new Document
router.post('/post', async (req, res) => {
    try {

        const data = req.body;
        const { email } = req.body;

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            return res.status(400).json({ error: "Invalid email address" })
        }

        const existEmail = await Student.findOne({ email })

        if (existEmail) {
            return res.status(400).json({ error: "Email Already Exists" })
        }

        const response = await Student.create(req.body)

        res.status(200).json({ message: 'File uploaded successfully' });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: 'Error', error: error.message });

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

        console.log(error);
        res.status(500).json({ message: 'Error', error: error.message });

    }
})

//Deleting All Doument
router.delete('/deleteAll', async (req, res) => {
    try {


        const response = await Student.deleteMany()

        res.status(200).json({ message: 'Files Deleted successfully' });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: 'Error', error: error.message });

    }
})

//Delete By Id
router.delete('/delete/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const response = await Student.findByIdAndDelete(id)

        res.status(200).json({ message: 'File Deleted successfully' });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: 'Error', error: error.message });

    }
})




module.exports = router;