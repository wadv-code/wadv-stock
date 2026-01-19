import { requestMain } from '@renderer/lib/http';

/**
 * MsgItemQury，系统消息查询
 */
export interface MsgParams {
  /**
   * 数据ID
   */
  id?: null | string;
  /**
   * 数据ID 集和
   */
  ids?: string[] | null;
  /**
   * 数据ID(int)
   */
  int_id?: number | null;
  /**
   * 数据ID(int) 集和
   */
  int_ids?: number[] | null;
  /**
   * 关键字
   */
  key_word?: null | string;
  /**
   * 未读  1
   */
  msg_read?: null | string;
  /**
   * 类型 1 普通消息 2流程审批
   */
  msg_type?: null | string;
  /**
   * 当前页码
   */
  page?: number;
  /**
   * 每页数量
   */
  pageSize?: number;
}

export interface MsgItem {
  id: string;
  isDeleted: boolean;
  buildIntervalStr: string;
  fromUserId: string;
  toUserId: string;
  msgType: number;
  msgTypeString: string;
  msgCat: string;
  msg: string;
  objectId: string;
  url: string;
  isRead: boolean;
  readTime: string;
  createdOn: string;
}

/**
 * 获取我的消息列表
 * @returns 获取我的消息列表
 */
export const PostUserMessages = (data: MsgParams) => {
  return requestMain<{
    items: MsgItem[];
  }>({
    url: '/api-base/Msg/user_messages',
    method: 'post',
    data
  });
};

/**
 * 批量设置消息为已读状态
 * @returns 批量设置消息为已读状态
 */
export const PutSetSelectedReaded = (rows: string[]) => {
  return requestMain({
    url: '/api-base/Msg/set_selected_readed',
    method: 'put',
    data: { rows }
  });
};

/**
 * 获取用户未读消息数量
 * @returns 获取用户未读消息数量
 */
export const GetUserMessagesUnreadCount = () => {
  return requestMain<number>({
    url: '/api-base/Msg/user_messages_unreadcount',
    method: 'GET'
  });
};

export interface UnsendMsg {
  id: string;
  title: string;
  msg: string;
  obj_id: string;
  created_on: string;
}

/**
 * 获取用户未发送的消息
 * @returns 获取用户未发送的消息
 */
export const GetUnsendMsgs = () => {
  return requestMain<UnsendMsg[]>({
    url: '/api-base/Msg/unsend_msgs',
    method: 'GET'
  });
};

/**
 * 将消息标记为已发送
 * @returns 将消息标记为已发送
 */
export const PutSetMsgSend = (id: string) => {
  return requestMain({
    url: `/api-base/Msg/set_msg_send?id=${id}`,
    method: 'PUT'
  });
};
