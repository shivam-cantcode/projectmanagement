// class Apiresponse {
//   constructor(statuscode, data, message = "sucess") {
//     this.statuscode = statuscode;
//     this.data = data;
//     this.message = message;
//     this.sucess = statuscode < 400;
//   }
// }

// export { Apiresponse };

/*
for clearner version
*/

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
