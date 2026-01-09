import { LucideProps } from 'lucide-vue-next';
import { FunctionalComponent } from 'vue';

export type StockAttrDownMenuItem = {
  type: string;
  name: string;
  value: number;
  icon: FunctionalComponent<LucideProps>;
  className: string;
};
