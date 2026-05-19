// import { Apiresponse } from "../utils/api_response.js";
// import { asyncHandler } from "../utils/aysnc.handler.js";

// // const healthcheck = async (req, res, next) => {
// //   try {
// //     res
// //       .status(200)
// //       .josn(new Apiresponse(200, { message: "server is running" }));
// //   } catch (error) {
// //     next(err);
// //   }
// // };

// const healthcheck = asyncHandler(async (res, req) => {
//   res.status(200).json(new Apiresponse(200, { message: "server is running" }));
// });

// export { healthcheck };

/*
for clearner version
*/

import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async.handler.js";

const healthcheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Server is running" }));
});

export { healthcheck };
