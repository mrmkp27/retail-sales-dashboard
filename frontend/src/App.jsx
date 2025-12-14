import SalesDashboard from './components/SalesDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <SalesDashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;