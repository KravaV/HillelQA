var arr = [
    {
        userName:"Test",
        lastName:"Test",
        email:"test.test@gmail.com"
    },
    {
        userName:"Dmitro",
        lastName:"Porohov",
        email:"dmitro.porohov@yahoo.com"
    },
    {
        userName:"Andrii",
        lastName:"",
        email:"andrii@mail.ru" 
    }
]

var regular = /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)?@(gmail\.com|yahoo\.com)$/;

var necessaryEmails = [];
for (var i = 0; i < arr.length; i++) {
  var sort = arr[i].email;
  if (typeof sort === "string" && regular.test(sort)) {
    necessaryEmails.push(sort);
  }
}
console.log(necessaryEmails);