$.query = (sParam) => {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'), sParameterName, i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

$.http = new class {
  constructor() {
    this.baseURL = 'https://auth.api.vrcollab.com/v1';
  }

  _request(method, url, body, token) {
    const headers = {'Content-Type': 'application/json; charset=utf-8'};
    if (token) headers['Authorization'] = token;
    const request = {
      url: this.baseURL + url,
      type: method,
      headers,
      contentType: 'application/json'
    };
    if (method !== 'GET') request['data'] = JSON.stringify(body);

    return new Promise((resolve, reject) => {
      $.ajax(request).fail((jqXHR => reject(jqXHR))).done((data) => {
        if (token) localStorage.setItem('Token', token);
        resolve(data);
      });
    });
  }

  get(url, token) {
    return this._request('GET', url, null, token);
  }

  post(url, body, token) {
    return this._request('POST', url, body, token);
  }

  patch(url, body, token) {
    return this._request('PATCH', url, body, token);
  }
}

$.account = new class {
  token() {
    return localStorage.getItem('Token') || $.query('token');
  }

  register(email, name, password) {
    return $.http.post(
        '/user/register', {Email: email, Name: name, Password: password});
  }

  login(email, password) {
    return $.http.post('/user/login', {Email: email, Password: password})
        .then(data => {
          localStorage.setItem('Token', data.Token);
          return data;
        })
        .catch(data => data);
  }

  logout() {
    localStorage.removeItem('Token');
  }

  valid() {
    return $.http.get('/user/profile', this.token());
  }

  update_password(password) {
    return $.http.patch('/user/password', {Password: password}, this.token())
        .then(data => true)
        .catch(data => data);
  }

  update_profile(name, company, industry) {
    return $.http
        .patch(
            '/user/profile', {Name: name, Company: company, Industry: industry},
            this.token())
        .then(data => true)
        .catch(data => data);
  }

  reset_password(email) {
    return $.http.post(`/user/reset_password?email=${email}`, {});
  }

  send_verify_email() {
    return $.http.post('/user/verify_email', {}, this.token());
  }

  verify_email(uid, token) {
    return $.http.get(`/user/verify_email?uid=${uid}&token=${token}`);
  }

  contact_us(email, name, message) {
    return $.http.post(
        '/mailgun/contact_us', {Email: email, Name: name, Message: message});
  }
}