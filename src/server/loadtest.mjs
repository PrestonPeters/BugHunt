import loadtest from "loadtest";

const initOptions = {
  url: 'http://localhost:8080/init', // Change the URL to the endpoint you want to test
  concurrency: 10, // Number of concurrent requests
  maxRequests: 200, // Total number of requests to make
};

// Load test GET request
loadtest.loadTest(initOptions, (error, result) => {
  if (error) {
    console.error('Load test failed with error:', error);
  } else {
    console.log('GET request load test results:', result);
  }
});

// Configuration for load testing
const options = {
  url: 'http://localhost:8080/getPosts', // Change the URL to the endpoint you want to test
  concurrency: 10, // Number of concurrent requests
  maxRequests: 200, // Total number of requests to make
};

// Load test GET request
loadtest.loadTest(options, (error, result) => {
  if (error) {
    console.error('Load test failed with error:', error);
  } else {
    console.log('GET request load test results:', result);
  }
});

// Configuration for load testing POST request
const postOptions = {
  url: 'http://localhost:8080/addPost', // Change the URL to the endpoint you want to test
  method: 'POST',
  concurrency: 10, // Number of concurrent requests
  maxRequests: 200, // Total number of POST requests to make
  contentType: 'application/json',
  body: JSON.stringify({ topic: 'Test Topic', data: 'Test Data, BUT ABSOLUTELY MASSIVE SO MUCH BIGGER THAN YOUD EXPECT, SURELY, CERTAINLY! HAHAHAHAHAHAHAHHAHAHHAHAHAHAHAHHAHAHAHHHAHHAAHHAHAHAHAHHAHAHAHAHH' }), // Example POST data
};

// Load test POST request
loadtest.loadTest(postOptions, (error, result) => {
  if (error) {
    console.error('Load test failed with error:', error);
  } else {
    console.log('POST request load test results:', result);
  }
});