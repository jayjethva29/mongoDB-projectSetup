const AppError = require("../utils/AppError");

/**Filters out the fields which are allowed
 * @param {[String]} allowedFields - An array of the fields that are allowed in the body
 * @param {{}} body - req.body
 */
exports.filterBody = (allowedFields, body) => {
  Object.keys(body).forEach((el) => {
    if (!allowedFields.includes(el)) delete body[el];
  });
};

/**Removes the specified fields from the body
 * @param {[String]} removeFields - An array of the fields that will  be removed from the body
 * @param {{}} body - req.body
 */
exports.removeFieldsFromBody = (removeFields, body) => {
  Object.keys(body).forEach((el) => {
    if (removeFields.includes(el)) delete body[el];
  });
};

/**
 * @param {mongoose.Model} Model
 * @param {{}} options
 * @param options.allowedFields -[String] An array of the fields that are allowed in the body
 * @param options.removeFields -[String] An array of the fields that will  be removed from the body
 */
exports.createOne = (Model, options) => async (req, res, next) => {
  try {
    if (options?.removeFields)
      this.removeFieldsFromBody(options.removeFields, req.body);
    if (options?.allowedFields)
      this.filterBody(options.allowedFields, req.body);

    const newDoc = await Model.create(req.body);

    newDoc.__v = undefined;
    res.status(200).json({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = (Model, options) => async (req, res, next) => {
  try {
    const docs = await Model.find();

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @param {mongoose.Model} Model
 * @param {{}} options
 * @param options.populate [String | Object]
 * @param options.select
 */
exports.getOne = (Model, options) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (options?.populate)
      options.populate.forEach((opt) => (query = query.populate(opt)));
    //if (options?.select) query = query.select(options.select);
    //const doc = await query;
    const doc = await query;

    if (!doc)
      return next(
        new AppError(404, `No data found for this id: ${req.params.id}!`)
      );

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @param {mongoose.Model} Model
 * @param {{}} options
 * @param options.allowedFields -[String] An array of the fields that are allowed in the body
 * @param options.removeFields -[String] An array of the fields that will  be removed from the body
 */
exports.updateOne = (Model, options) => async (req, res, next) => {
  try {
    if (options?.removeFields)
      this.removeFieldsFromBody(options.removeFields, req.body);
    if (options?.allowedFields)
      this.filterBody(options.allowedFields, req.body);

    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc)
      return next(
        new AppError(404, `No data found for this id: ${req.params.id}!`)
      );

    updatedDoc.__v = undefined;
    res.status(200).json({
      status: "success",
      data: {
        data: updatedDoc,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);

    if (!deletedDoc)
      return next(
        new AppError(404, `No data found for this id: ${req.params.id}!`)
      );

    res.status(200).json({
      status: "success",
      data: null,
    });

    next();
  } catch (err) {
    next(err);
  }
};
