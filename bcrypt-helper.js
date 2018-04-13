const bcrypt = require('bcrypt');
const rounds = 10; 

exports.bcryptHelper = {
  
    cryptPassword: function(password, callback) {
   
      bcrypt.genSalt(rounds, function(err, salt) {
        
        if (err)  {
        
          return callback(err);
        }
        
        bcrypt.hash(password, salt, function(err, hash) {
        
          return callback(err, hash);
        });
      });
    },

    comparePassword : function(plainPass, hashword, callback) {
      bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {   
          return err == null ?
              callback(null, isPasswordMatch) :
              callback(err);
      });
   }
}