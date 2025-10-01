import { type IconName } from '@/lib/icons'
import { ClassName } from '.'
export interface LinkItem {
  type: string;
  icon: IconName;
  href: string;
  label?: string;
  enabled: boolean;
  style?: ClassName;
}
