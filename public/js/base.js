/*
 * @Author: 李聪
 * @Date: 2021-06-24 10:19:06
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-24 17:08:19
 * @Description: 
 */

class Anbase {
  constructor(base) {
    this.base = base
  }

  get() {
    console.log(this.base);
  }
}

const base = new Anbase('base1');
base.get();

class UseBase extends Anbase {
  constructor(use) {
    super();
    this.use = use
  }
  getUse() {
    console.log('use', this.use, 'base', this.base);
  }
}

const use = new UseBase('use1')