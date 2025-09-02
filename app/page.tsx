
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function App() {

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <button onClick={signOut} className="sign-out-button">
            Sign Out
          </button>
          <main>{user ? <div>Welcome, {user.username}</div> : null}</main>
        </div>
      )}
    </Authenticator>
  );
}
