import React from 'react';
import Layout from "../components/Layout/Layout.jsx";
import {useAuth} from "../context/auth.jsx";

const Homepage = () => {
    const [auth, setAuth] = useAuth();
    return(
      <Layout title={'Omkara'}>
            <h1>Homepage</h1>
          <pre>{JSON.stringify(auth, null, 4)}</pre>
      </Layout>
    );
};
export default Homepage;