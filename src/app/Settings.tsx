import type { Route } from './routes';
import { usePlayer } from '../state/PlayerContext';
import { MenuScreen, type MenuItem } from '../components/ui/MenuScreen';

interface Props {
  onBack: () => void;
  onMain: () => void;
  onOpen: (route: Route) => void;
}

export function Settings({ onBack, onMain, onOpen }: Props) {
  const { state } = usePlayer();
  const items: MenuItem[] = [
    { icon: '👤', label: 'Account', sublabel: 'Username, email, password', onClick: () => onOpen('account') },
    {
      icon: '⭐',
      label: 'Subscription',
      sublabel: state.subscribed ? 'Premium · active' : 'Free plan',
      onClick: () => onOpen('subscription'),
    },
    { icon: '↺', label: 'Reset progress', sublabel: 'Start a language over', onClick: () => onOpen('reset') },
  ];
  return <MenuScreen title="Settings" items={items} onBack={onBack} onMain={onMain} />;
}
