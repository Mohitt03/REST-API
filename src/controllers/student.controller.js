const express = require('express')
const router = express.Router();
const Student = require('../models/student.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')
const asyncHandler = require('../utils/asyncHandler')
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const { uploadOnCloudinary } = require("../utils/cloudinary.js")

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await Student.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {


    const { email, age, course, username, password, phonenumber } = req.body


    if (
        [email, age, course, username, password, phonenumber].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await Student.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "Student with email or username already exists")
    }




    if (!req.file.buffer) {
        throw new ApiError(400, "profileImage file is required")
    }


    const result = await uploadOnCloudinary(req.file.buffer);



    const user = await Student.create({
        username: username.toLowerCase(),
        email,
        age,
        course,
        phonenumber,
        password,
        profileImage: result.secure_url // 👈 THIS IS THE ADDITION

    })

    const createdUser = await Student.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "Student registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    let { email, username, password } = req.body
    username = username.toLowerCase();


    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }


    const user = await Student.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "Student does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    console.log(process.env.EMAIL, process.env.PASSWORD, user.email);


    // Sending Otp to the user email
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });


    const otp = crypto.randomBytes(3).toString('hex');

    const otpExpires = Date.now() + 3600000; // 1 hour
    // req.session.otp = otp;

    user.otp = otp
    await user.save({ validateBeforeSave: false })

    console.log(otp);


    // req.session.otpExpires = Date.now() + 3600000; // 1 hour

    const mailOptions = {
        to: user.email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);

            throw new ApiError(500, error.message)
            return res.status(500).send(error.toString());

        }
        res.status(200).send('Success');
    });

    // Temporary Login Token
    const loginToken = jwt.sign(
        { userId: user._id },
        process.env.LOGIN_TOKEN_SECRET,
        { expiresIn: "5m" }
    );


    res.cookie("login_token", loginToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1 * 60 * 1000 // 1 Hour
        // maxAge: 5 * 60 * 1000 // 5 minutes
    });



    // const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await Student.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        // .cookie("accessToken", accessToken, options)
        // .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, TemporaryToken: loginToken
                },
                "Student logged In Successfully & Otp is sent on the user email please go to this /verfiyOtp Route for getting the tokens"
            )
        )

})


const verifyOtp = asyncHandler(async (req, res) => {

    const loginToken = req.cookies?.login_token || req.header("Authorization")?.replace("Bearer ", "");
    console.log(loginToken);


    let userOtp = req.body.otp;

    if (!loginToken)
        return res.status(401).json({ message: "Session expired" });

    const decoded = jwt.verify(
        loginToken,
        process.env.LOGIN_TOKEN_SECRET
    );

    const userId = decoded.userId;

    const student = await Student.findById(userId);

    if (!student)
        return res.status(400).json({ message: "User not found" });

    // 3️⃣ Check expiration
    // if (student.otp.expiresAt < Date.now())
    //     return res.status(400).json({ message: "OTP expired" });

    console.log("username", student);
    // 4️⃣ Hash incoming OTP
    // const incomingOtpHash = crypto
    //     .createHash("sha256")
    //     .update(otp)
    //     .digest("hex");

    // 5️⃣ Compare OTP hashes
    // if (student.otp !== userOtp) {
    //     otpRecord.attempts += 1;
    //     await otpRecord.save();

    //     // Optional: block after 5 attempts
    //     if (otpRecord.attempts >= 5) {
    //         await OTP.deleteOne({ _id: otpRecord._id });
    //         return res.status(429).json({ message: "Too many attempts" });
    //     }

    //     return res.status(400).json({ message: "Invalid OTP" });
    // }

    console.log(student.otp, userOtp);


    if (student.otp !== userOtp) {
        throw new ApiError(401, "Wrong Otp or Expired")
    }

    // 6️⃣ OTP is correct → delete OTP
    await Student.findByIdAndUpdate(userId,
        {
            $unset: {
                otp: 1 // this removes the field from document
            }
        });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(student._id)
    const options = {
        httpOnly: true,
        secure: true
    }



    return res
        .status(200)
        .clearCookie("login_token", options)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    "Token": accessToken, refreshToken
                },
                "Student logged In Successfully"
            )
        )

    // } catch (err) {
    //     res.status(500).json({ message: "Server error" });
    // }
    // });

})


const logoutUser = asyncHandler(async (req, res) => {
    await Student.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Student logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await Student.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

module.exports = {
    registerUser,
    loginUser,
    verifyOtp,
    logoutUser,
    refreshAccessToken
}