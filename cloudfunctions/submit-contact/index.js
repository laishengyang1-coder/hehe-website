/**
 * CloudBase 云函数：处理「联系我们」表单提交
 * --------------------------------------------------
 * 触发方式（二选一）：
 *   1) 静态网站托管路由：/api/*  →  本云函数（推荐，同源无跨域）
 *   2) 云函数 HTTP 访问服务：独立 HTTPS 地址（需在 contact.html 填 API_URL）
 *
 * 数据持久化：写入云数据库集合 `contacts`
 * 返回格式：集成响应 { statusCode, headers, body }
 */

const cloudbase = require('@cloudbase/node-sdk');

// 缓存 cloudbase 实例（云函数内 init 不传 env 会自动使用当前环境）
let _app = null;
function getApp() {
  if (!_app) {
    const env = process.env.TCB_ENV;
    _app = env ? cloudbase.init({ env }) : cloudbase.init();
  }
  return _app;
}

// 兼容 API 网关 / 静态托管路由等多种 event 结构
function parseEvent(event) {
  const method = (event.httpMethod ||
    (event.requestContext && event.requestContext.httpMethod) ||
    (event.context && event.context.httpMethod) || 'GET').toUpperCase();

  let rawBody = event.body || '';
  if (typeof rawBody !== 'string') rawBody = JSON.stringify(rawBody);
  // API 网关可能以 base64 传输
  if (event.isBase64Encoded && rawBody) {
    rawBody = Buffer.from(rawBody, 'base64').toString('utf8');
  }
  return { method, rawBody };
}

function res(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(payload)
  };
}

exports.main = async (event, context) => {
  const { method, rawBody } = parseEvent(event);

  // 处理浏览器 CORS 预检
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (method !== 'POST') {
    return res(405, { ok: false, msg: '仅支持 POST 请求' });
  }

  // 解析请求体（JSON 或 application/x-www-form-urlencoded）
  let data = {};
  try {
    if (rawBody.trim().startsWith('{')) {
      data = JSON.parse(rawBody);
    } else if (rawBody) {
      for (const [k, v] of new URLSearchParams(rawBody).entries()) data[k] = v;
    }
  } catch (e) {
    return res(400, { ok: false, msg: '请求数据格式有误' });
  }

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();
  const address = (data.address || '').trim();
  const message = (data.message || '').trim();

  if (!name || !phone || !message) {
    return res(400, { ok: false, msg: '请完整填写姓名、电话和留言内容' });
  }

  try {
    const db = getApp().database();
    // 集合不存在时自动创建（避免手动建集合；已存在会报错，忽略即可）
    try {
      await db.createCollection('contacts');
    } catch (e) { /* 已存在时忽略 */ }
    await db.collection('contacts').add({
      name, phone, email, address, message,
      createdAt: new Date(),
      status: 'new'
    });
    return res(200, { ok: true, msg: '提交成功，我们会尽快与您联系' });
  } catch (e) {
    return res(500, { ok: false, msg: '服务器写入失败：' + e.message });
  }
};
