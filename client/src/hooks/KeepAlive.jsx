import { useEffect } from 'react';

const useKeepAlive = (endpoints, intervalTime = 15 * 60 * 1000) => {
  useEffect(() => {
    const sendKeepAliveRequests = () => {
      endpoints.forEach(endpoint => {
        fetch(endpoint)
          .then(response => {
            console.log(`Keep-alive ping to ${endpoint} successful:`, response);
          })
          .catch(error => {
            console.error(`Keep-alive ping to ${endpoint} failed:`, error);
          });
      });
    };

    sendKeepAliveRequests();
    const interval = setInterval(sendKeepAliveRequests, intervalTime);

    return () => clearInterval(interval);
  }, [endpoints, intervalTime]);
};

export default useKeepAlive;
