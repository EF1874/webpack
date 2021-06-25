/*
 * @Author: 李聪
 * @Date: 2021-06-25 10:48:34
 * @LastEditors: 李聪
 * @LastEditTime: 2021-06-25 10:49:09
 * @Description: 模拟数据接口
 */

module.exports = {
  'GET /user': {
    name: 'lisi'
  },
  'POST /login/account': (req, res) => {
    const {
      password,
      username
    } = req.body
    if (password === '888888' && username === 'admin') {
      return res.send({
        status: 'ok',
        code: 0,
        token: 'sdfsdfsdfdsf',
        data: {
          id: 1,
          name: 'lisi'
        }
      })
    } else {
      return res.send({
        status: 'error',
        code: 403
      })
    }
  }
}