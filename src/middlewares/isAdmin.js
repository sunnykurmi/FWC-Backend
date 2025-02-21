const ErorrHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");

exports.isAdmin = catchAsyncErrors(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        throw new ErorrHandler("please login with correct email address.", 401)
    }
});