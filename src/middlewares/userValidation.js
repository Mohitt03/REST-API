const Joi = require('joi');
const ApiError = require('../utils/ApiError')

const userValidation = (req, res, next) => {
    const { username, email, password, } = req.body;
    const userInfo = {
        username,
        email,
        password
    }

    const schema = Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .min(8)
            .max(15),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    })

    const { error } = schema.validate(userInfo);
    if (error) {
        // return res.status(501).json({error: error.details[0].message});
        throw new ApiError(422, error.details[0].message)

    };
    next()
}

module.exports = { userValidation }