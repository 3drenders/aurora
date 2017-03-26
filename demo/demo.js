'use strict';

function update(event){

    if(event.keyCode == 13) {
        let value = document.querySelector('.input').value;
        let image = document.querySelector('.image');

        console.log(value);

        let xhr = new XMLHttpRequest();
        var url = "http://localhost:3000";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json = JSON.parse(xhr.responseText);
                image.src = json;

            }
        };

        var data = JSON.stringify({"text": value});
        xhr.send(data);
    }
}

