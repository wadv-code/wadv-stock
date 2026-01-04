import { nextTick } from 'vue';

/**
 * 设置浏览器标题
 * @method title = useTitle(); ==> title()
 */
export function useTitle(title: unknown) {
  nextTick(() => {
    const globalTitle: string = import.meta.env.VITE_APP_NAME;
    document.title = title ? `${title} - ${globalTitle}` || globalTitle : globalTitle;
  }).then(() => {});
}
