import React, { useState } from 'react';
import './App.css';
import firebaseConfig from './firebase.config';
import firebase from "firebase/app";
import "firebase/auth";
import { Avatar, Grid, Typography, Paper, TextField, Button } from '@material-ui/core';

function App() {

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    password: ''
  })

  const provider = new firebase.auth.GoogleAuthProvider();

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const { displayName, photoURL, email } = result.user;

        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);

      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error(errorMessage);
      });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(() => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          photo: '',
          error: '',
          success: false
        }
        setUser(signedOutUser);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  const handleSubmit = (e) => {

    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.success = true;
          newUserInfo.error = '';
          setUser(newUserInfo);
          updateUser(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.success = true;
          newUserInfo.error = '';
          setUser(newUserInfo);
          console.log(res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    e.preventDefault();
  }

  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHashNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHashNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const updateUser = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    })
      .then(function () {
        console.log('new user update successful')
      })
      .catch(function (error) {
        console.log('error')
      });
  }

  // design part
  const paperStyle = {
    padding: '30px 20px',
    width: 300,
    margin: '20px auto'
  }

  const buttonStyle = {
    marginTop: '10px'
  }


  return (
    <div className="App">


      <h2>Our Own Authentication</h2>
      <input type="checkbox" name="newUser" onChange={() => setNewUser(!newUser)} />
      <label htmlFor="newUser">New User Sign Up</label>
      <Grid>
        <Paper elevation={20} style={paperStyle}>
          <Grid align="center">
            <Avatar>

            </Avatar>
            <h2>Sign Up</h2>
            <Typography variant='caption'>Please fill this form to create an account</Typography>
          </Grid>
          <form onSubmit={handleSubmit}>
            {newUser && <TextField fullWidth onBlur={handleBlur} name="name" label="name"></TextField>}
            <TextField fullWidth onBlur={handleBlur} name="email" label="email"></TextField>
            <TextField fullWidth onBlur={handleBlur} name="password" type="password" label="password"></TextField>
            <Button style={buttonStyle} type="submit" variant="contained" color="primary">{newUser ? 'Sign Up' : 'Sign In'}</Button>
          </form>
          <p style={{ textAlign: 'center', color: 'red' }}>{user.error}</p>
          {user.success && <p style={{ textAlign: 'center', color: 'red' }}>User {newUser ? 'created' : 'logged in'} successfully</p>}


          {
            user.isSignedIn ?
              <button onClick={handleSignOut}>Sign out</button> :
              <Button style={buttonStyle} type="submit" variant="contained" color="primary" onClick={handleSignIn}>Sign in with Google</Button>
          }
          {
            user.isSignedIn && <div>
              <p>Welcome to {user.name}</p>
              <p>Email: {user.email}</p>
              <img src={user.photo} alt="" />
            </div>
          }



        </Paper>
      </Grid>


    </div>
  );
}

export default App;
