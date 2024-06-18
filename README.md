This is one of my projects from my CMPT353 (Full Stack Web Programming) class where I was required to make a sort of simplified StackOverflow clone
where users can create accounts in order to create channels and posts and peruse other people's channels and posts in order to get help with their
own coding problems and attempt to help people solve their own.

For this project, I used a Node.js server for queries from the client to the database to populate the site, a MySQL database for the actual data
storage, and a React app for the HTML, and Javascript that present the actual website. 

To compose everything into one package, I recommend using Docker as there are Dockerfiles included in the package and also a docker-compose.yml file
so running the React app, its server, and database is as simple as following the below steps:

1. Clone the repository to your desired directory.
2. If you do not already have Docker Desktop installed, navigate to https://www.docker.com/products/docker-desktop/ and follow the install instructions.
3. Once Docker Desktop has been installed, either open the desktop app or run the below command to start the Docker Daemon:
   - sudo systemctl start docker
4. Once the Docker Daemon is running, navigate to the cloned directory and run the below command to start the React app, Node.js server, and MySQL database:
   - docker-compose up --build
5. Once this has completed, navigate to a browser and enter the below URL to access the site:
   - localhost:3000
6. The website will open at this point and you can either login with the inbuilt admin account (username and password both admin) or create your own account
   to experiment with the website.

Every time that the package is built, it initializes a clean database with no channels and the only account being the admin account. Administrators, per the
assignment description, can delete channels, posts, and users on top of being able to create channels and posts themselves. Posts and channels can be sorted
by various means and posts themselves can be replied to and these replies can nest and be visualized. Posts and replies can also be liked or disliked which
contributes to a user's overall rank on the website. The server and database will also stay persistent so long as the Docker containers are not deleted.
Users can also attach images to their posts and in their replies as well. 

The website is a very simple prototype project that is very roughly formatted to be functional, familiar, and easy to use, but looks were not a high priority 
in creating this assignment.
