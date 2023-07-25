const { ExtractJwt, Strategy } = require('passport-jwt');
const { admins, roles }      = require('../models');
const { CONFIG }        = require('../config/config');
const {to}          = require('../services/util.service');

module.exports = function(passport){
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_admin_encryption;
    passport.use(new Strategy(opts, async function(jwt_payload, done) {
        let err, user;
        [err, user] = await to(admins.findByPk(jwt_payload.user_id));
        [err, userRole] = await to(roles.findByPk(user.role_id));
        user.role = userRole;
        if(err) {
            return done(err, false);
        }
        if(user) {
            return done(null, user);
        }else{
           
            return done(null, false);
        }
    }));
}