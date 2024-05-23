// This will prevent authenticated(registered) users from accessing this route
import React from 'react'
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth)

  if (token === null) {
    return children
  } else {
    return <Navigate to="/dashboard/my-profile" /> // This line redirects the user to the /dashboard/my-profile route.(This line updating the browser's URL)
  }
}

export default OpenRoute