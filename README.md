## Introduction
   This is one of my projects from my CMPT353 (Full Stack Web Programming) class where I was required to make a sort of simplified StackOverflow clone
   where users can create accounts in order to create channels and posts and peruse other people's channels and posts in order to get help with their
   own coding problems and attempt to help people solve their own.
   
   For this project, I used a Node.js server for queries from the client to the database to populate the site, a MySQL database for the actual data
   storage, and a React app for the HTML, and Javascript that present the actual website. 

   Every time that the package is built (see Running Instructions), it initializes a clean database with no channels and the only account being the admin account. 
   Administrators, per the assignment description, can delete channels, posts, and users on top of being able to create channels and posts themselves. Posts and 
   channels can be sorted by various means and posts themselves can be replied to and these replies can nest and be visualized. Posts and replies can also be liked 
   or disliked which contributes to a user's overall rank on the website. The server and database will also stay persistent so long as the Docker containers are not 
   deleted. Users can also attach images to their posts and in their replies as well. 
   
   The website is a very simple prototype project that is very roughly formatted to be functional, familiar, and easy to use, but looks were not a high priority 
   in creating this assignment.

## Prerequisites:
   Docker Desktop must be installed in order to run this application. To install, perform the following steps:
      1. Navigate to https://www.docker.com/products/docker-desktop/ and download the Docker Desktop application
      2. Run the install application following the install instructions

## Running Instructions

   1. Clone the repository to your desired directory by navigating to your desired directory via the command line. Then, run the following command to clone the repo:
         git clone https://github.com/PrestonPeters/BugHunt.git
   2. Open the Docker Desktop app or, if using a Linux or Ubuntu system, run the following command to start the Docker Daemon:
         sudo systemctl start docker
   3. Once the Docker Daemon is running, navigate to the cloned directory and run the following command to start the React app, Node.js server, and MySQL database:
         docker-compose up --build
   4. Once this has completed, navigate to a browser and enter the following URL to access the site:
         localhost:3000
   5. The website will open at this point and you can either login with the inbuilt admin account (username and password both admin) or create your own account
      to experiment with the website.
   6. Once you are finished with the website, you can shut it down by pressing CTRL+C
   7. To get rid of all of the containers built in the process, you can use the command:
         docker-compose down -v


## PLEASE NOTE:
   The project, as configured, will require the use of local network ports 3000 (for the React App), 3306 (for the MySQL database), and 8080 (for the Node.js server).
   If this is in conflict with your port configurations, go into the docker-compose.yml and reconfigure the port numbers for the React App, MySQL database, and the
   Node.js server as needed.
