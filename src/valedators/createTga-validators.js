const Joi = require("joi");

const validate = require("./validate");

const createTagSchema = Joi.object({
  TagName: Joi.string().trim(),
  image: Joi.string().trim()
}).or("TagName", "image");

exports.validateCreateTag = validate(createTagSchema);
