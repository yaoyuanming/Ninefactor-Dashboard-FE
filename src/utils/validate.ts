// 邮箱校验
export function emailValidate(value: string, callback: any) {
  if (!value) {
    return callback('邮箱不能为空');
  }
  const emailRegExp = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!emailRegExp.test(value)) {
    return callback('请输入正确的邮箱地址');
  }
  return callback();
}

export function psdValidate(value: string, callback: any) {
  if (!value) {
    return callback('密码不能为空');
  }
  const regExp =
    /^(?=(?:.*[A-Za-z]+.*[0-9]+|.*[A-Za-z]+.*[!@#$%^&*()_+|\\[\]{}:;<>,.?/~]+|.*[0-9]+.*[!@#$%^&*()_+|\\[\]{}:;<>,.?/~]+)).{6,18}$/g;
  if (!regExp.test(value)) {
    return callback('长度6-18，至少包含字母、数字、特殊字符中的两种');
  }
  return callback();
}
