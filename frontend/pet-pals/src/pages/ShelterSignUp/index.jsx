import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ajax } from "../../ajax";
import "./style.css";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LoginContext } from "../../contexts/LoginContext";
import { jwtDecode } from "jwt-decode";

function ShelterSignUp() {
  const [error, setError] = useState("");
  const [errorJson, setErrorJson] = useState({});
  const [isGoogle, setGoogle] = useState(false);
  const [googleCred, setGoogleCred] = useState({});
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(LoginContext);

  function validateForm() {
    // Your validation logic here
    const shelterName = document.getElementById("shelter_name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const password1 = document.getElementById("password1").value;

    // Example validation, you can customize based on your requirements
    if (!shelterName || !username || !password || !email || !password1) {
      setError("All fields must be filled out.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorJson({ email: "Enter a valid email address." });
      return false;
    }

    if (password.length < 8) {
      setErrorJson({
        password:
          "This password is too short. It must contain at least 8 characters.",
      });
      return false;
    }

    if (!/\d/.test(password)) {
      setErrorJson({ password: "Password must contain at least one digit." });

      return false;
    }

    if (password !== password1) {
      setErrorJson({ password1: "Passwords do not match." });
      return false;
    }

    // Additional validation checks if needed

    return true;
  }
  const handleButtonClick = () => {
    // Use the navigate function to redirect to '/'
    navigate("/");
  };

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  function handle_google(googleCred) {
    let data = new FormData();
    data.append("shelter_name", googleCred.name);
    data.append("username", googleCred.email);
    data.append("email", googleCred.email);
    data.append("password", googleCred.email);
    data.append("password1", googleCred.email);

    // Convert the profile photo URL to a file and append it to the form data
    fetch(googleCred.picture)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "profile_photo.jpg", {
          type: "image/jpeg",
        });
        data.append("profile_photo", file);
        login(data);
      })
      .catch((error) => console.error("Error fetching image:", error));

    // Continue with the login or other logic
  }

  //   function handle_google(googleCred) {
  //     let data = new FormData();
  //     data.append(
  //       "shelter_name",
  //       googleCred.given_name + " " + googleCred.family_name
  //     );
  //     data.append("username", googleCred.email);
  //     data.append("email", googleCred.email);
  //     data.append("password", googleCred.email);
  //     data.append("password1", googleCred.email);
  //     data.append("profile_photo", googleCred.picture);
  //     let photodata = new FormData();

  //     login(data);
  //   }

  function handle_submit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log(event.target);
    let data = new FormData(event.target);
    console.log(data.get("username"));
    console.log(data.get("shelter_name"));
    console.log(data.get("password"));
    console.log(data.get("password1"));
    console.log(data.get("email"));
    login(data);
  }

  // function upload_pic(data) {
  //     event.preventDefault();

  //     const formData = new FormData();

  //     // Append user data
  //     if (event.target.fileInput.files[0]) {
  //         formData.append('user.profile_photo', event.target.fileInput?.files[0] ? event.target.fileInput?.files[0] : "http://localhost:8000/media/default.jpg");

  //     }

  //     //console.log(formData.get('user.phone_number'));
  //     console.log(formData.get('user.profile_photo'));

  //     // if you are here, validation passed, so make PUT request
  //     try {
  //         const requestOptions = {
  //             method: 'PUT',
  //             headers: {
  //                 Authorization: `Bearer ${localStorage.getItem('access')}`,
  //             },
  //             body: formData, // Use the FormData object directly as the body
  //         };

  //         fetch(`http://localhost:8000/shelter/${currentUser.id}/`, requestOptions)
  //             .then((response) => response.json())
  //             .then((data) => { console.log(data); })
  //     } catch (error) {
  //         console.error('Error:', error);

  //     }
  // }
  function login(data) {
    ajax("/shelter/account/", {
      method: "POST",
      body: data,
    })
      .then((request) => request.json())
      .then((json) => {
        console.log(json);
        if ("access_token" in json) {
          localStorage.setItem("access", json.access);
          localStorage.setItem("username", json.shelter.user.username);
          localStorage.setItem("custom_user", json.shelter.user.id.toString());
          localStorage.setItem("shelter_name", json.shelter.shelter_name);
          localStorage.setItem("id", json.shelter.id.toString());
          localStorage.setItem(
            "profile_photo",
            json.shelter.user.profile_photo.toString()
          );
          setCurrentUser(json.shelter);
          navigate("/");
        } else if ("errors" in json) {
          setErrorJson(json.errors);
        } else {
          setError("Unknown error while signing in.");
        }
      })
      .catch((error) => {
        console.error(error);
        setError("Unknown error while signing in.");
      });
  }

  return (
    <div className="mainContainer" style={{ marginTop: "50px" }}>
      <main>
      <div className="topnav" style={{ width: "80vw", borderTopRightRadius: "10px", borderTopLeftRadius: "10px"}}>
        <Link to="/seeker/signup/">Pet Seekers</Link>
        <Link to="/shelter/signup/" className="active">
          Pet Shelters
        </Link>
      </div>

      <div className="outerContainer">
      <div className="containerNEW" style={{paddingBottom: "30px", borderTopRightRadius: "0px", 
      borderTopLeftRadius: "0px",}}>
          <div className="titles">
            <p className="subTitle">Join the family today!</p>
            <h1 className="mainTitle">Sign Up</h1>
          </div>
          <form id="signup" onSubmit={handle_submit}>
            <h2 style={{ marginTop: "0px" }}>
              Please create your account below
            </h2>

            <div className="inputNEW">
              <label htmlFor="shelter_name">Shelter Name: </label>
              <input
                type="text"
                id="shelter_name"
                name="shelter_name"
                className="descriptionInput"
                required
              />
              <p className="error">{errorJson.shelter_name || ""}</p>
            </div>
            <div className="inputNEW">
              <label htmlFor="email">Email: </label>
              <input
                className="descriptionInput"
                type="email"
                id="email"
                name="email"
                required
              />
              <p className="error">{errorJson.email || ""}</p>
            </div>

            <div className="inputNEW">
              <label htmlFor="username">Username: </label>
              <input
                className="descriptionInput"
                type="text"
                id="username"
                name="username"
                required
              />
              <p className="error">{errorJson.username || ""}</p>
            </div>

            <div className="inputNEW">
              <label htmlFor="password">Password: </label>
              <input
                className="descriptionInput"
                type="password"
                id="password"
                name="password"
                required
              />
              <p className="error">{errorJson.password || ""}</p>
            </div>

            <div className="inputNEW">
              <label htmlFor="password1">Confirm Password: </label>
              <input
                className="descriptionInput"
                type="password"
                id="password1"
                name="password1"
                required
              />
              <p className="error">{errorJson.password1 || ""}</p>
            </div>

            <div
              className="buttons"
              style={{
                flexDirection: "row",
                justifyContent: "center",
                margin: "20px",
              }}
            >
              <button className="btn" type="submit">
                Sign Up
              </button>
              <button className="btn" onClick={handleButtonClick}>
                Cancel
              </button>
            </div>
            <p className="error">{error}</p>
          </form>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const credentialResponseDecoded = jwtDecode(
                credentialResponse.credential
              );
              setGoogle(true);
              setGoogleCred(credentialResponseDecoded);
              handle_google(credentialResponseDecoded);
              console.log(credentialResponseDecoded);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
            isSignedIn={true}
          />
          <div className="switchLink">
            <p className="text">Already have an account?</p>
            <a
              style={{ color: "#0854a0", cursor: "pointer" }}
              className="linkSignUp"
              onClick={() => navigate("/shelter/login/")}
            >
              Log In!
            </a>
          </div>
        </div>
      </div>
      </main>
    </div>

  );
}

export default ShelterSignUp;
