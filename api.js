const axios = require("axios");

const transformRequest = jsonData =>
  Object.entries(jsonData)
    .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
    .join("&");

let cookies;

module.exports = {
  getMyIP() {
    return axios({
      url: 'https://www.gamanlab.com/public-ip/',
      method: 'get'
    })
  },
  init(baseUrl) {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = baseUrl;
    axios.defaults.headers["Content-Type"] =
      "application/x-www-form-urlencoded";

    axios.interceptors.response.use(
      function(response) {
        if (response && response.headers && response.headers["set-cookie"]) {
          cookies = response.headers["set-cookie"];
        }
        return response.data;
      },
      function(error) {
        return Promise.reject(error);
      }
    );
  },
  login(user, pass) {
    return axios("/login/?login_only=1", {
      method: "post",
      data: transformRequest({
        user,
        pass
      })
    });
  },

  fetchZone(security_token, domain) {
    const data = {
      cpanel_jsonapi_apiversion: 2,
      cpanel_jsonapi_module: "ZoneEdit",
      cpanel_jsonapi_func: "fetchzone",
      domain,
      type: "A"
    };
    return axios({
      url: `${security_token}/json-api/cpanel`,
      method: "post",
      headers: {
        Cookie: cookies[1]
      },
      data: transformRequest(data)
    });
  },

  patchDNS(security_token, data) {
    data = {
      ...data,
      cpanel_jsonapi_apiversion: 2,
      cpanel_jsonapi_module: "ZoneEdit",
      cpanel_jsonapi_func: "edit_zone_record"
    };

    return axios(`${security_token}/json-api/cpanel`, {
      method: "post",
      headers: {
        Cookie: cookies[1]
      },
      withCredentials: true,
      data: transformRequest(data)
    });
  }
};
