/*
 * @Author: 李聪
 * @Date: 2021-06-24 11:39:26
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-24 14:24:08
 * @Description: 
 */
class Another {
  constructor(other) {
    this.other = other
  }

  showOther() {
    console.log(this.other);
  }
}

const other = new Another('other1');