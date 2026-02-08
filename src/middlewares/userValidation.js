const Joi = require('joi');
const ApiError = require('../utils/ApiError')

const userValidation = (req, res, next) => {
    const { username, age, course, email, password, } = req.body;
    const userInfo = {
        username,
        email,
        password,
        age,
        course
    }


    const schema = Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .required(),

        age: Joi.number()
            .integer()
            .min(10)
            .required(),

        course: Joi.string()
            .trim()
            .required(),

        password: Joi.string()
            .min(8)
            .max(15)
            .required(),

        email: Joi.string()
            .email()
            .required()
    });


    const { error } = schema.validate(userInfo);
    if (error) {
        // return res.status(501).json({error: error.details[0].message});
        console.log(error);

        throw new ApiError(422, error.details[0].message)

    };
    next()
}

module.exports = { userValidation }