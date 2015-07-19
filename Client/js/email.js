"use strict";

console.log("email.js starting");


addEventListener('load', start);

function start() {

  var a = document.getElementById('email');

  a.addEventListener('click', function onclick(event) {
      console.log('CLICKED');
      show();
      event.preventDefault();
  })

  function show() {
    document.getElementById('popup').style.display = 'block';
  }
  
  function hide(){
    document.getElementById('popup').style.display = 'none';
  }

  var cancel = document.getElementById('cancel');
  cancel.addEventListener('click', function onclick(event) {
    console.log('CLICKED');
    hide();
    event.preventDefault();
  })

}
