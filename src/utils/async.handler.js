// const asyncHandler = (requestHanler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHanler(res, req, next)).catch((err) => next(err));
//   };
// };

// export { asyncHandler };

/*
for clearner version
*/

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export { asyncHandler };
