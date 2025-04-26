import { useEffect } from 'react';
import { ConversationNavigator } from './components/ConversationNavigator';

export default function App() {
  useEffect(() => {
    console.log('content ui loaded');
  }, []);

  return (
    <div className="absolute w-[210px] top-[56px] left-1/2 transform -translate-x-1/2 max-h-screen overflow-auto flex items-center justify-between gap-2 rounded bg-blue-100 px-2 py-1">
      <ConversationNavigator />
    </div>
  );
}
