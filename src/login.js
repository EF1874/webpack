/*
 * @Author: 李聪
 * @Date: 2021-06-24 15:09:41
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-24 17:15:50
 * @Description: 
 */

class Login {
  constructor(user) {
    this.user = user
  }

  getUser() {
    console.log(this.user);
  }
}

const lisi = new Login('lisi1');