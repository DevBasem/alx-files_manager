import sha1 from 'sha1';

class Password {
  static encryptPassword(password) {
    return sha1(password);
  }

  static isPasswordValid(password, hashedPassword) {
    return sha1(password) === hashedPassword;
  }
}

export default Password;
