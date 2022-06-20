import axios from 'axios'
import React, {useState, useEffect} from 'react';

const InformationCards = () => {

  const [pinCards, setPinCards] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        // console.log(response);
        setPinCards(response.data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  return <div className='InformationCard'>
    {pinCards && <pre>{JSON.stringify(pinCards, null, 0)}</pre>}
    {error && <h4>Error is: { error }</h4>}
  </div>;
}

export default InformationCards