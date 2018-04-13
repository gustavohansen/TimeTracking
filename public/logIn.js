document.forms[0].onsubmit = function(){

    event.preventDefault();

    var user = document.getElementById('user').value;
    var password = document.getElementById('password').value;
    var request = new XMLHttpRequest();

    if(password == '' || user == '') {
        alert('User and Password are required!');

        return;
    }

    request.addEventListener("load", function(){
        if(this.status == 200) {

            window.location.href = '/';
        }
        else {
            alert(this.responseText);
        }
    });

    request.open("GET", `/authenticate?user=${user}&password=${password}`);
    request.send();

}