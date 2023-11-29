const Joi = require("joi");
const validate = require("./validate");

const createCommentPost = Joi.object({
  title: Joi.string().trim()
});

exports.validateCreateCommentPost = validate(createCommentPost);
