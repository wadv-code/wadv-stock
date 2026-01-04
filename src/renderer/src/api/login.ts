import { requestMain } from '@renderer/lib/http';

export interface PostPhoneLoginData {
  token: string;
  expirationTime: number;
}
export interface PostPhoneLoginParams {
  phone: string;
  code: string;
}

/**
 * 登录系统 - 使用手机号验证码 -
 * @returns 登录成功返回 token 和过期时间
 */
export async function PostPhoneLogin<T = PostPhoneLoginData>(data: PostPhoneLoginParams) {
  return requestMain<T>({
    url: '/api-base/Auth/phone_login',
    method: 'POST',
    data
  });
}

/**
 * 获取手机验证码
 * @returns 发送成功返回验证码
 */
export async function GetGetVcode<T = any>(params: { phone: string }) {
  return requestMain<T>({
    url: '/api-base/Sms/get_vcode',
    method: 'GET',
    params
  });
}

export interface GetUserInfoData {
  token?: string;
  user: UserInfo;
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export async function GetUserInfo<T = GetUserInfoData>() {
  return requestMain<T>({
    url: '/api-base/Auth/userinfo',
    method: 'GET'
  });
}
