var password = document.getElementById("password")
, confirm_password = document.getElementById("confirm_password");

function validatePassword(){
if(password.value.length < 4 === true){
  password.setCustomValidity("Passwords should be at least 4 character long");
}
else{
  password.setCustomValidity('');
}
if(password.value != confirm_password.value) {
  confirm_password.setCustomValidity("Passwords Don't Match");
} else {
  confirm_password.setCustomValidity('');
}

}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;

