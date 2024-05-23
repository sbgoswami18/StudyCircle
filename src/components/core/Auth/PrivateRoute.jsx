// This will prevent unauthenticated(not-registered) users from accessing this route
import React from 'react'
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth)

  if (token !== null) {
    return children
  } else {
    return <Navigate to="/login" /> // This line redirects the user to the /login route.(This line updating the browser's URL)
  }
}

export default PrivateRoute