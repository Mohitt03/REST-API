const Joi = require('joi');
const ApiError = require('../utils/ApiError')

const studValidation = (req, res, next) => {
    const { name, email, age, course } = req.body;
    const studInfo = {
        name,
        email,
        age,
        course
    }

    const schema = Joi.object({
        name: Joi.string().trim().min(2).required(),
        email: Joi.string().email().required(),
        age: Joi.number().integer().min(10).required(),
        course: Joi.string().trim().required()
    })

    const { error } = schema.validate(studInfo)
    if (error) {
        throw new ApiError(422, error.details[0].message)
    };
    next()

};

module.exports = studValidation;
