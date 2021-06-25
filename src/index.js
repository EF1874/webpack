/*
 * @Author: 李聪
 * @Date: 2021-06-23 14:08:15
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-25 16:08:02
 * @Description: 
 */
import './style/index.less';
import $ from "jquery";
// if (module && module.hot) {
//   module.hot.accept()
// }

class Animal {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }
}

class Dog extends Animal {
  constructor(name, cry) {
    super();
    this.name = name;
    this.cry = cry
  }

  getCry() {
    console.log(
      this.cry
    );
  }
}
const dog = new Dog('dog', 'wangwang');

if (DEV === 'dev') {
  //开发环境
  fetch("/login/account", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: "admin",
        password: "888888"
      })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
} else {
  //生产环境
  console.log('生产环境');
}

console.log('body', $('body'));