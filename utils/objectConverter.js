exports.userResponse = (user) => {
    let userResult = [];
    user.forEach(usr => {
        userResult.push({
            name: usr.name,
            userId: usr.userId,
            email: usr.email,
            userType: usr.userType,
            userStatus: usr.userStatus
        });
    });
    return userResult;
}