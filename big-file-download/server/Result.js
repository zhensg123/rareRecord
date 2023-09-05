module.exports = class Result {
    constructor(status, message, data) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  
    static success(data) {
      return new Result(200, 'Success', data);
    }
  
    static error(message, status = 500) {
      return new Result(status, message, null);
    }
  }


