import ErrorBoundary from '../components/ErrorBoundary';
import ChatInterface from '../components/chat/ChatInterface';

export default function Home() {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
}