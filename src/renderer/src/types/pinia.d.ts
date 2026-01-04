// 用户信息
declare interface UserInfo {
  avatar?: string;
  own_user: string;
  dep_id: string;
  dep_name: string;
  org_id: string;
  org_name: string;
  created_on: string;
  modified_on: string;
  is_dis: boolean;
  files: [];
  imgs: [];
  id: string;
  int_id: number;
  uint_id: number;
  login_name: string;
  open_id: string;
  card: string;
  user_code: string;
  name: string;
  sex: string;
  mobile_phone: string;
  work_place: string;
  id_card_type: string;
  id_card: string;
  enter_time: string;
  posi_time: string;
  leave_time: string;
  contract_type: string;
  contract_begin: string;
  contract_end: string;
  birthday: string;
  dwelling: string;
  is_attend: boolean;
  attend_no: string;
  is_full_attend: boolean;
  is_check: boolean;
  is_salary: boolean;
  is_virtual: boolean;
  sort: number;
  remark: string;
  role_name: string;
  role_id: string[];
  createdOn: string;
  lastLoginTime: string;
}

// 用户状态机
declare interface UserState {
  userInfo: UserInfo;
  username: string;
  token?: string;
}
