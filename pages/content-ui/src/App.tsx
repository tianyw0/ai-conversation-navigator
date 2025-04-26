import { useEffect } from 'react';
import { ConversationNavigator } from './components/ConversationNavigator';

export default function App() {
  useEffect(() => {
    console.log('content ui loaded');
  }, []);

  return (
    <div className="absolute w-[310px] top-[56px] left-1/4 transform -translate-x-1/2 max-h-[calc(100vh-56px)] overflow-auto flex flex-col gap-2 rounded bg-blue-100 px-2 py-1">
      <ConversationNavigator />
    </div>
  );
}
