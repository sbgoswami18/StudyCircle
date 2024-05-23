import React from 'react';

const HighlightText = ({text}) => {
  return (
    <span className='font-bold' style={{color: '#38bdf8'}}>
        {" "}
        {text}
    </span>
  )
}

export default HighlightText
