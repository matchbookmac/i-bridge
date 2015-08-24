module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        isEmail: true,
        unique: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    },
    {
      classMethods: {
        findWithToken: function (token, callback) {
          this.findOne({ where: { token: token }})
            .then(callback)
            .catch(function (err) {
              callback(err);
              console.log('There was an error finding user with token: ' + token + ': ' + err);
            });
        }
      }
    }
  );
  return User;
};
