import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { CharadesApp } from '@/components/CharadesApp';

function App() {
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hide();
    };
    hideSplash();
  }, []);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden">
      <CharadesApp />
    </div>
  );
}

export default App;