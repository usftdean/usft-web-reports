const apiURL = 'http://localhost:3001';
let new_apiURL = typeof apiURL === 'undefined' ? 'http://localhost:3001' : null;
// reassign if not present
 if (new_apiURL) {
    apiURL = new_apiURL;
}
function getDataFromNodeCall(routeMethod, routeID, paramObj) {
    return new Promise(async (resolve, reject) => {
        var RequestObj = paramObj
        var request = new XMLHttpRequest()
        request.open(routeMethod, apiURL + routeID, true)
        request.withCredentials = true;
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onload = function () {
            var data = JSON.parse(this.response);
            if (request.status >= 200 && request.status < 400) {
                // return the data.....
                return resolve(data);
            } else if (data.error) {
                return reject('error: ' + data.error);
            }
        }
        request.send(JSON.stringify(RequestObj));
    })
}
