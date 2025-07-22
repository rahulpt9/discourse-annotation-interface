// helpers for storing token
export function saveToken(token) {
    localStorage.setItem('access', token);
  }
  
  export function getToken() {
    return localStorage.getItem('access');
  }
  
  export function isLoggedIn() {
    const token = localStorage.getItem('access');
    return typeof token === 'string' && token.trim().length > 0;
  }
  