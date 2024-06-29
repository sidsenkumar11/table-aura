import CssBaseline from '@mui/material/CssBaseline';
import blue from '@mui/material/colors/lightBlue';
import red from '@mui/material/colors/red';
import green from '@mui/material/colors/green';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';

import RestaurantOwnerDashboard from './components/RestaurantOwnerDashboard';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: blue,
    error: red,
    success: green,
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <main>
            <Routes>
              <Route exact path="/" element={<RestaurantOwnerDashboard />} />
            </Routes>
            <Navigate from="*" to="/" />
          </main>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
