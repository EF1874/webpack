/*
 * @Author: 李聪
 * @Date: 2021-06-24 10:19:29
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-24 17:08:27
 * @Description: 
 */

class Anutils {
  constructor(utils) {
    this.utils = utils
  }

  get() {
    console.log(this.utils);
  }
}

// const utils = new Anutils('utils1');
// utils.get();

class UseUtils extends Anutils {
  constructor(use) {
    super();
    this.use = use
  }
  getUse() {
    console.log('use', this.use, 'base', this.base);
  }
}

const use = new UseUtils('use1')