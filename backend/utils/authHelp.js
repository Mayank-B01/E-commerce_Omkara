const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    try{
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }catch(err){
        console.log(err);
    }
}
const comparePassword = async(password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
}

module.exports = {hashPassword, comparePassword};