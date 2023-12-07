import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ajax } from "../../ajax";
import "./style.css";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LoginContext } from "../../contexts/LoginContext";
import { jwtDecode } from "jwt-decode";

function SeekerLogin() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(LoginContext);

  function handle_google(googleCred) {
    let data = new FormData();
    data.append("username", googleCred.email);
    data.append("password", googleCred.email);
    let photodata = new FormData();

    login_user(data);
  }

  const handleButtonClick = () => {
    // Use the navigate function to redirect to '/'
    navigate("/");
  };

  function handle_submit(event) {
    let data = new FormData(event.target);
    data.set("username", event.target.username.value || "");
    data.set("password", event.target.password.value || "");
    console.log(data.get("username"));
    console.log(data.get("password"));

    if (data.get("username") === "") {
      setError("Username can not be blank.");
    } else if (data.get("password") === "") {
      setError("Password can not be blank.");
    } else {
      login_user(data);
    }
    event.preventDefault();
  }

  function login_user(data) {
    ajax("/seeker/token/", {
      method: "POST",
      body: data,
    })
      .then((request) => request.json())
      .then((json) => {
        if ("access" in json) {
          localStorage.setItem("access", json.access);
          localStorage.setItem("username", json.seeker.user.username);
          localStorage.setItem("custom_user", json.seeker.user.id.toString());
          localStorage.setItem("firstname", json.seeker.firstname);
          localStorage.setItem("lastname", json.seeker.lastname);
          localStorage.setItem("id", json.seeker.id.toString());
          localStorage.setItem(
            "profile_photo",
            json.seeker.user.profile_photo.toString()
          );
          setCurrentUser(json.seeker);
          navigate("/");
        } else if ("detail" in json) {
          setError(json.detail);
          console.log(json.detail);
        } else {
          setError("Unknown error while signing in.");
        }
      })
      .catch((error) => {
        setError(error);
      });
  }

  return (
    <div className="mainContainer" style={{marginTop: "50px"}}>
    <main>
      <div className="topnav" >
        <Link to="/seeker/login/" className="active">
          Pet Seekers
        </Link>
        <Link to="/shelter/login/">Pet Shelters</Link>
      </div>
      <div className="outerContainer">
      <div className="container" style={{paddingBottom: "20px", borderTopRightRadius: "0px", 
      borderTopLeftRadius: "0px",}}>
          <div className="titles">
            <p className="subTitle">Welcome Back Pet Seeker!</p>
            <h1 className="mainTitle">Log In</h1>
          </div>
          <form id="login" onSubmit={handle_submit}>
            <h2 style={{marginTop: "0px"}}>Please enter your login information</h2>
            <div className="inputNEW">
              <label htmlFor="username">Username: </label>
              <input className="descriptionInput" type="text" id="username" name="username" required />
            </div>

            <div className="inputNEW">
              <label htmlFor="password">Password: </label>
              <input className="descriptionInput" type="password" id="password" name="password" required />
            </div>
            <p className="error">{error}</p>

            <div className="buttons" style={{flexDirection: "row", justifyContent: "center", margin: "20px"}}>
              <button className="btn" type="submit">
                Login
              </button>
              <button className="btn" onClick={handleButtonClick}>
                Cancel
              </button>
            </div>
            
          </form>
          <GoogleLogin
            buttonText="Log in with Google"
            onSuccess={(credentialResponse) => {
              const credentialResponseDecoded = jwtDecode(
                credentialResponse.credential
              );
              //setGoogle(true);
              //setGoogleCred(credentialResponseDecoded);
              handle_google(credentialResponseDecoded);
              console.log(credentialResponseDecoded);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
            isSignedIn={true}
          />
          <div className="switchLink">
            <p className="text">Don't have an account yet?</p>
            <Link
              className="linkSignUp"
              style={{ color: "#0854a0" }}
              to="/seeker/signup/"
            >
              Sign up!
            </Link>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}

export default SeekerLogin;
