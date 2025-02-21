exports.sendtoken = async (user, message, statuscode, res) => {
    let twk_fwc = user.getjwttoken();

    let options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' for production, 'Lax' for development
    };

    res.status(statuscode)
        .cookie("twk_fwc", twk_fwc, options)
        .json({
            success: true,
            message: message,
            id: user._id,
            twk_fwc,
        });
};