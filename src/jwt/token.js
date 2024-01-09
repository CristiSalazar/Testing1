import jwt from 'jsonwebtoken';

export function setToken(res, email, password) {
  const token = jwt.sign({ email, password, role: "user" }, "Secret-key", { expiresIn: "24h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
  return token
}

export function emailFromTokenLogin(token) {
  try {
    const decoded = jwt.verify(token, 'Secret-key');
    return decoded.email;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null; 
  }
}

export function setTokenEmail(email) {
  const token = jwt.sign({ email }, 'secreto', { expiresIn: '1h' });
  return token
}
export function emailFromToken(token) {
  try {
    const decoded = jwt.verify(token, 'secreto');
    const email = decoded.email;
    return email;
  } catch (error) {
    console.error('Error con el token:', error);
    return null;
  }
}

export function TokenResetPass(token) {
  try {
    const result = jwt.verify(token, 'secreto');
    return result;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('El token expiró');
      return null; 
    } else {
      console.error('Error al verificar token:', error);
      return null; 
    }
  }
}