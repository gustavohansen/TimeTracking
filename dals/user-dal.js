var BaseDal = require('./base-dal');

function UserDal() {
  
    BaseDal.call(this, 'users');
};

UserDal.prototype = Object.create(BaseDal.prototype);

UserDal.prototype.getUser = function(user, callback) {

    var query = new this.azure.TableQuery().where('userName eq ?', user);
    
    this.first(query, callback);
}

UserDal.prototype.exist = function(user, callback) {

  var query = new this.azure.TableQuery().where('userName eq ?', user);
  
  this.first(query, function(error, data){

      if(error != null) {
        callback(error);
      }
      else {
        
        return callback(null, data != null);
      }
  });
}

UserDal.prototype.create = function(userName, password, callback) {

    var entity = {

      userName: userName,
      password: password,
    };

    this.insert(entity, callback);
}

module.exports = UserDal;