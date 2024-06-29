import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Container,
  Stack,
} from '@mui/material';

import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

import { DataGrid } from '@mui/x-data-grid';

const RestaurantOwnerDashboard = () => {
  const [discountPercent, setDiscountPercent] = useState('');
  const [file, setFile] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch('/api/coupons');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const sortedRows = data.sort(function (a, b) {
          return a.id - b.id;
        });
        setTableData(sortedRows);
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };

    fetchTableData();
    const interval = setInterval(fetchTableData, 3000);

    return () => clearInterval(interval);
  }, [setTableData]);

  const handleFileUpload = event => {
    setFile(event.target.files[0]);
  };

  const handleUploadSubmit = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('discountPercent', discountPercent);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      alert('Upload successful');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed');
    }
  };

  const handleCouponSubmit = async event => {
    event.preventDefault();
    try {
      const response = await fetch('/api/coupon/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      alert('Coupon applied successfully');
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Failed to apply coupon');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'clicked', headerName: 'Clicked', width: 100 },
    { field: 'used', headerName: 'Used', width: 100 },
    { field: 'tracking_code', headerName: 'Tracking Code', width: 225 },
    { field: 'coupon_code', headerName: 'Coupon Code', width: 125 },
    { field: 'discount', headerName: 'Discount %', width: 100 },
    {
      field: 'first_name',
      headerName: 'First Name',
      valueGetter: (value, row) => row.User.first_name,
      width: 130,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      valueGetter: (value, row) => row.User.last_name,
      width: 130,
    },
    {
      field: 'email',
      headerName: 'Email',
      valueGetter: (value, row) => row.User.email,
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      valueGetter: (value, row) => row.User.phone,
      width: 150,
    },
  ];

  return (
    <Container style={{ marginTop: '20px' }}>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Card>
            <CardContent>
              <Stack alignItems="center" direction="row" gap={2}>
                <RestaurantMenuIcon />
                <Typography variant="h4" component="div">
                  Restaurant Management Portal
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Upload Users CSV
                </Typography>
                <form onSubmit={handleUploadSubmit}>
                  <TextField
                    type="number"
                    label="Discount %"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    inputProps={{ min: 1, max: 100 }}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    required
                  />
                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Use Coupon
                </Typography>
                <form onSubmit={handleCouponSubmit}>
                  <TextField
                    label="Coupon Code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid
          rows={tableData}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
    </Container>
  );
};

export default RestaurantOwnerDashboard;
