function postRequest(url, data, token, tokenPrefix) {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', url)
  xhr.setRequestHeader('Content-Type', 'application/json')
  if (token !== '') {
    if (tokenPrefix !== '') {
      token = tokenPrefix + token
    }
    xhr.setRequestHeader('Authorization', token)
  }
  var pms = new Promise(function (resolve, reject) {
    xhr.ontimeout = xhr.onerror = xhr.onabort = function (e) {
      reject({
        no: 500,
        msg: { timeout: '请求超时', error: '无法连接网络', abort: '请求中止' }[e.type],
        type: e.type
      })
    }
    xhr.onload = function () {
      resolve(JSON.parse(xhr.response))
    }
  })
  xhr.send(JSON.stringify(data))
  return pms
}

function apiRequest(url, data) {
  return postRequest(url, data)
}

function authApiRequest(url, data, token) {
  return postRequest(url, data, token)
}

function authApiRequestV2(url, data, token) {
  return postRequest(url, data, token, 'Bearer ')
}

function isMobileOs() {
  var userAgent = navigator.userAgent || navigator.vendor
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone'
  }
  if (/android/i.test(userAgent)) {
    return 'Android'
  }
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS'
  }
  return 'unknown'
}

function browserIsWx() {
  return /micromessenger/i.test(navigator.userAgent.toLowerCase()) ? 1 : 0
}

function getQueryString(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = decodeURI(window.location.search).substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}

function onBridgeReady() {
  window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
    'appId': document.getElementById('appId').value,
    'package': document.getElementById('package').value,
    'nonceStr': document.getElementById('nonceStr').value,
    'timeStamp': document.getElementById('timeStamp').value,
    'signType': 'MD5',
    'paySign': document.getElementById('paySign').value
  }, function (res) {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      window.location.href.back()
    }
  })
}

function h5PaySubmit(ip) {
  ip = 'https://api.tangerine.yx8668.com/pay_h5/?order_no=VT2023121815591544201140&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzQ0Mjk0MzYsImlhdCI6MTcwMjg5MzQzNiwiand0VXNlcklkIjoxfQ.aYnEbDX5JvG8VawittgiELpVPi_qZMxLcEid0iK1aCI'

  var orderNo = getQueryString('order_no')
  var token = getQueryString('token')
  if (!orderNo || !token) return
  getOrderInfo(orderNo, token).then(function (orderInfoRes) {
    if (orderInfoRes.code !== 0) {
      return
    }
    console.log(orderInfoRes)
    var orderInfo = orderInfoRes.data.order
    if (orderInfo.pay_type === 5) {
      h5PayWxSubmit(orderNo, token, ip).then(function (wechatPayH5Res) {
        console.log(wechatPayH5Res)
        if (wechatPayH5Res.code !== 0) {
          return
        }
        console.log(wechatPayH5Res.data.pay_url)
        if (isMobileOs()) {
          window.location.href = wechatPayH5Res.data.pay_url
        }
      }).catch(function (wechatPayH5Err) {
        console.log(wechatPayH5Err)
      })
    }
    if (orderInfo.pay_type === 6) {
      h5PayAliSubmit(orderNo, token, ip).then(function (aliPayH5Res) {
        console.log(aliPayH5Res)
        if (aliPayH5Res.code !== 0) {
          return
        }
        console.log(aliPayH5Res.data.pay_url)
        if (isMobileOs()) {
          window.location.href = aliPayH5Res.data.pay_url
        }
      }).catch(function (aliPayH5Err) {
        console.log(aliPayH5Err)
      })
    }
  }).catch(function (orderInfoErr) {
    console.log(orderInfoErr)
  })
}

function createOrder() {
  // https://api.tangerine.yx8668.com/pay_h5/?action=created_order&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzQ0Mjk0MzYsImlhdCI6MTcwMjg5MzQzNiwiand0VXNlcklkIjoxfQ.aYnEbDX5JvG8VawittgiELpVPi_qZMxLcEid0iK1aCI
  var action = getQueryString('action')
  var token = getQueryString('token')
  if (!token || !action) return
  console.log(action)

  if (action === 'created_order') {
    authApiRequest('/order/create', {
      'pay_type': 5, // 支付方式 5-微信h5支付 6-支付宝h5支付 7-微信app支付 8-支付宝app支付
      'goods_id': 1042, // 套餐ID
      'device': 3, // 设备类型 3-安卓 4-iOS
      'guid': '2d449e30-9d57-11ec-bf8a-4385209f815a' // 设备号
    }, token).then(function (orderRes) {
      console.log(orderRes)
      if (orderRes.code !== 0) {
        return
      }
      var paymentPage = 'https://api.tangerine.yx8668.com/pay_h5/?' + 'order_no=' + orderRes.data.order_no + '&token=' + token
      document.body.innerHTML = '<div style=\'font-size: 12px\'>订单号：' + orderRes.data.order_no + '</div><p><a href=\'' + paymentPage + '\' target=\'_blank\'></a></p>'
    }).catch(function (e) {
      console.log(e)
    })
  }
}

function getOrderInfo(orderNo, token) {
  return authApiRequest('/order/detail', {
    'order_no': orderNo,
  }, token)
}

function h5PayWxSubmit(orderNo, token, ip) {
  return authApiRequest('/pay/h5/wx', {
    'order_no': orderNo,
    'ip': ip,
  }, token)
}

function h5PayAliSubmit(orderNo, token, ip) {
  return authApiRequest('/pay/h5/ali', {
    'order_no': orderNo,
    'ip': ip,
  }, token)
}

function mchPaySubmit(orderNo='VN80202024032601193429783', token='0348abf58b2c7d4d177ffccb14f92b784c98ce289a4d1ff20070f279a3d3e46b5da71852dc0364a4e1e2949d5f6f1588', ip='weixin://wxpay/bizpayurl?pr=yLNOUWEzz') {
  return authApiRequest('/pay/wechat/mchpay', {
    'order_no': '',
    'ip': ip,
  }, token)
}

function getTime() {
  return apiRequest('https://kfapp.kfsafe.cn/api/v1/get_time')
}

function getAuthUserInfo(token) {
  return authApiRequestV2('https://kfapp.kfsafe.cn/api/v1/me', {}, token)
}

export function hq() {
  if (browserIsWx()) {
    mchPaySubmit().then(function (res) {
      // 微信浏览器
      if (typeof WeixinJSBridge == 'undefined') {
        if (document.addEventListener) {
          document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
        } else if (document.attachEvent) {
          document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
          document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
        }
      } else {
        onBridgeReady()
      }
    }).catch(function (e) {
    })
  } else if (isMobileOs()) {
    getTime().then(function (timeRes) {
      console.log(timeRes)
      if (timeRes.code === 200) {
        var ip = timeRes.data.ip
        // 移动端
        h5PaySubmit(ip)
      }
    }).catch(function (timeErr) {
    })
  }
  createOrder()
}
