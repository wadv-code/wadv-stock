import MessageBox, { MessageBoxProps } from '@renderer/components/message/MessageBox.vue';
import { createVNode, render } from 'vue';

// // 定义回调函数类型
// interface ConfirmResult {
//   confirm: () => void;
//   cancel: () => void;
// }

// 全局确认弹窗方法
export function useConfirm() {
  return function confirm(options: MessageBoxProps): Promise<boolean> {
    return new Promise((resolve) => {
      // 创建容器
      const container = document.createElement('div');
      document.body.appendChild(container);

      // 创建虚拟节点
      const vnode = createVNode(MessageBox, {
        ...options,
        isOpen: true,
        onConfirm: () => {
          resolve(true);
          // 销毁组件
          render(null, container);
          document.body.removeChild(container);
        },
        onCancel: () => {
          resolve(false);
          // 销毁组件
          render(null, container);
          document.body.removeChild(container);
        },
        onClose: () => {
          resolve(false);
          // 销毁组件
          render(null, container);
          document.body.removeChild(container);
        }
      });

      // 渲染组件
      render(vnode, container);
    });
  };
}

// 全局注册（可选，在 main.ts 中使用）
export function registerConfirm(app: any) {
  const confirm = useConfirm();
  app.config.globalProperties.$confirm = confirm;
}
