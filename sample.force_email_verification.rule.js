function (user, context, callback) {
  if (!user.email_verified) {
    return callback(new UnauthorizedError('Please verify your email before logging in.['+user.user_id+']'));
  } else {
    return callback(null, user, context);
  }
}
