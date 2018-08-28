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

  get(url, token) {
    const headers = {'Content-Type': 'application/json; charset=utf-8'};
    if (token) headers['Authorization'] = token;
    return new Promise((resolve, reject) => {
      $.ajax({
         url: this.baseURL + url,
         type: 'GET',
         headers,
         contentType: 'application/json'
       })
          .done((data) => resolve(data))
          .fail((jqXHR => reject(jqXHR)));
    });
  }

  post(url, body, token) {
    const headers = {'Content-Type': 'application/json; charset=utf-8'};
    if (token) headers['Authorization'] = token;
    return new Promise((resolve, reject) => {
      $.ajax({
         url: this.baseURL + url,
         type: 'POST',
         headers,
         contentType: 'application/json',
         data: JSON.stringify(body)
       })
          .done((data) => resolve(data))
          .fail((jqXHR => reject(jqXHR)));
    });
  }

  patch(url, body, token) {
    const headers = {'Content-Type': 'application/json; charset=utf-8'};
    if (token) headers['Authorization'] = token;
    return new Promise((resolve, reject) => {
      $.ajax({
         url: this.baseURL + url,
         type: 'PATCH',
         headers,
         contentType: 'application/json',
         data: JSON.stringify(body)
       })
          .done((data) => resolve(data))
          .fail((jqXHR => reject(jqXHR)));
    });
  }
}

$.account = new class {
  token() {
    return localStorage.getItem('Token')
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